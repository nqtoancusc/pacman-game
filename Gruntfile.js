/*global module:false*/
/* jshint -W099 */
module.exports = function(grunt) {
	
	var paths = {
		dev: 'app/public',
		prod: 'dist'
	};

	var presentations = [
		'pacman'
	];

	var presentationsConfig = {};
	presentations.forEach(function(p) {
		presentationsConfig[p] = grunt.file.readJSON(
			paths.dev + '/presentations/' + p + '/config.json');
	});
	
	function getPresentationConfigFilepaths(scheme, component, type) {
		var prefixedArr = [];
		presentationsConfig[scheme].include[component][type].forEach(function(path) {
			prefixedArr.push(paths.dev + '/' + path);
		});
		return prefixedArr;
	}
	
	function getPresentationConcatFiles() {
		var filenameTypemap = {
			js: 'script.js',
			css: 'style.css'
		};
		var concatFiles = [];
		presentations.forEach(function(scheme) {
			['screen', 'remote'].forEach(function(component) {
				['css', 'js'].forEach(function(type) {
					var filesObj = {
						src: getPresentationConfigFilepaths(scheme, component, type),
						dest: paths.prod + '/presentations/' + scheme + '/' +
								component + '/' + type + '/' + filenameTypemap[type]
					};
					concatFiles.push(filesObj);
				});
			});
		});
		return concatFiles;
	}

	function getRenamedProductionFiles(type) {
		var renamedFiles = {
			expand: true,
			cwd: paths.prod,
			src: 'presentations/*/**/*.' + type,
			dest: paths.prod,
			rename: function(dest, src) {
				return dest + '/' + src.replace('.' + type, '.<%= pkg.version %>.min.' + type);
			}
		};
		return renamedFiles;
	}

	function getHtmlBuild(suffix) {
		var targets = {};
		presentations.forEach(function(p) {
			['screen', 'remote'].forEach(function (type) {
				// eg. "presentations/presname/screen/js/*.js"
				var path = ['presentations', p, type, suffix, '*.' + suffix];
				targets[p + '_' + type] = {
	       			cwd: paths.prod,
	        		files: path.join('/')
	       		};
			});
		});
		return targets;
	}

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

		concat: {
			options: {
				stripBanners: true
			},
			presentations: {
				files: getPresentationConcatFiles()
			}
		},

	    uglify: {
			options: {
				report: 'min',
				banner: '<%= banner %>',
				compress: {
					drop_console: true
				}
			},
			dist: getRenamedProductionFiles('js')
		},

		cssmin: {
			options: {
				report: 'min',
				banner: '<%= banner %>',
			},
			dist: getRenamedProductionFiles('css')
		},

		clean: {
			dist: paths.prod,
			postmin: {
				src: [
					paths.prod + '/**/*.js',
					paths.prod + '/**/*.css',
					'!' + paths.prod + '/**/*.min.js',
					'!' + paths.prod + '/**/*.min.css'
				]
			}
		},

		htmlbuild: {
	        dist: {
	        	expand: true,
	        	cwd: paths.dev,
				src: [
					'**/*.html',
					'!bower_components/**'
				],
				dest: paths.prod,
	            options: {
	                // beautify: true,
	                relative: false,
					prefix: '/',
					scripts: getHtmlBuild('js'),
					styles: getHtmlBuild('css')
	            }
	        }
	    },

	    htmlmin: {
			options: {
				removeComments: true,
				collapseWhitespace: true
			},
			dist: {
				expand: true,
				cwd: paths.prod,
				src: [
					'**/*.html'
				],
				dest: paths.prod
			}
		},

		copy: {
			dist: {
				files: [
					{
						expand: true,
						cwd: paths.dev,
						src: [
							'presentations/*/config.json',
							'presentations/*/*/images/**',
							'bower_components/**/*.{js,css,woff,ttf,svg}',
							'dashboard/**'
						],
						dest: paths.prod
					}
				]
			}
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			app_files: {
				src: [
					'app/lib/**/*.js',
					paths.dev + '/lib/qrremote-toolkit/*.js',
					paths.dev + '/presentations/**/*.js',
					paths.dev + '/dashboard/**/*.js'
				]
			}
		},

		watch: {
			css: {
				files: [
					paths.dev + '/presentations/**/*.css',
					paths.dev + '/dashboard/**/*.css'
				],
				options: { livereload: true }
			},
			html: {
				files: [
					paths.dev + '/presentations/**/*.html',
					paths.dev + '/dashboard/**/*.html'
				],
				options: { livereload: true }
			},
			lib_test: {
				files: '<%= jshint.app_files.src %>',
				tasks: ['jshint:app_files']
			},
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile']
			},
			server: {
				files: ['.grunt/rebooted'],
				options: { livereload: true }
			}
		},

		concurrent: {
			dev: {
				tasks: ['nodemon', 'node-inspector', 'watch'],
				options: { logConcurrentOutput: true }
			}
		},

		nodemon: {
			dev: {
				script: 'app/server.js',
				options: {
					cwd: __dirname,
					nodeArgs: ['--debug'],
					env: {
						PORT: '8501',
						DEV: true
					},
					ignore: ['node_modules/**'],
					callback: function(nodemon) {
						nodemon.on('log', function(event) {
							console.log(event.colour);
						});
						// Refreshes browser when server reboots
						nodemon.on('restart', function() {
							setTimeout(function() {
								require('fs').writeFileSync('.grunt/rebooted', 'rebooted');
							}, 2000);
						});
					}
				}
			}
		},

		bowerInstall: {
			target: {
				src: [ paths.dev + '/dashboard/index.html' ]
			}
		},

		'node-inspector': {
			dev: { }
		}
	});
	
	require('load-grunt-tasks')(grunt);
  
	grunt.registerTask('default', ['concurrent']);
	grunt.registerTask('build', [
		'clean:dist',
		'concat',
		'uglify',
		'cssmin',
		'clean:postmin',
		'htmlbuild',
		'htmlmin',
		'copy'
		]);
	grunt.registerTask('testbuild', [
		'clean:dist',
		'concat',
		'htmlbuild',
		'copy'
		]);
};
