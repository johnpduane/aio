module.exports = function (grunt) {
	require('time-grunt')(grunt);
	require('jit-grunt')(grunt, {
		bower: "grunt-bower-task"
	});

	var _ = require("lodash");

	var buildPath = "./dist";
	var assetsPath = buildPath + "/assets";

	var pkg = grunt.file.readJSON("package.json");
	var localConfig = grunt.file.readJSON("localConfig.json");

	grunt.initConfig({
		pkg: pkg,
		localConfig: localConfig,
		"less": {
			"default": {
				"options": {
					"paths": "app/less",
					"yuicompress": true,
					"compress": false
				},
				"src": "app/less/main.less",
				"dest": assetsPath + "/css/<%= pkg.name %>.css"
			},
			"min": {
				"options": {
					"paths": "app/less",
					"yuicompress": true,
					"compress": true
				},
				"src": "<%= less.default.dest %>",
				"dest": assetsPath + "/css/<%= pkg.name %>.min.css"
			}
		},
		"concat": {
			"lib": {
				"src": [
					"bower_components/jquery/dist/jquery.min.js",
					"bower_components/bootstrap/dist/js/bootstrap.min.js",
					"app/js/prism.js"
				],
				"dest": assetsPath + "/js/<%= pkg.name %>-lib.min.js"
			}
		},
		"copy": {
			"templates": {
				"expand": true,
				"cwd": "app/templates",
				"src": ["**/*.hbs"],
				"dest": buildPath + "/"
			},
			"fonts": {
				"files" : [
					{
						"expand": true,
						"cwd": "app/fonts",
						"src": "**/*",
						"dest": assetsPath + "/fonts"
					},
					{
						"expand": true,
						"cwd": "bower_components/fontawesome/fonts",
						"src": "**/*",
						"dest": assetsPath + "/fonts"
					},
				]
			},
			"package": {
				"src": "package.json",
				"dest": buildPath + "/"
			}
		},
		"rsync": {
			"default": {
				"options": {
					"src": buildPath + "/",
					"dest": "<%= localConfig.dest %>",
					"host": "<%= localConfig.host %>",
					"recursive": true,
					"syncDest": true,
					"exclude": [".git*"]
				}
			},
			"watch": {
				"options": {
					"src": buildPath + "/",
					"dest": "<%= localConfig.dest %>",
					"host": "<%= localConfig.host %>",
					"recursive": true,
					"syncDest": false,
					"exclude": [".git*"]
				}
			}
		},
		"compress": {
			"main": {
				"options": {
					"archive": '<%= pkg.name %>-<%= pkg.version %>.zip'
				},
				"files": [
					{
						"expand": true,
						"cwd": "dist/",
						"src": '**/*'
					}
				]
			}
		},
		"clean": {
			"default": [ buildPath ]
		},
		"watch": {
			"options": {
				"livereload": true
			},
			"hbs": {
				"files": ["app/templates*/**/*.hbs"],
				"tasks": ["copy:templates", "patternReplace", "rsync:watch"]
			},
			"css": {
				"files": ["app/less/**/*.less"],
				"tasks": ["less", "rsync:watch"]
			},
			"js": {
				"files": ["app/js/**/*.js"],
				"tasks": ["concat", "rsync:watch"]
			}
		},
		"patternReplace": {
			"default": {
				"options": {
					"tokens": _.merge(localConfig, pkg)
				},
				"files": [
					{
						"expand": true,
						"cwd": buildPath,
						"src": "**/*.hbs",
						"dest": buildPath
					}
				]
			}
		}
	});

	// Register tasks
	grunt.registerTask("build", ["clean", "less", "concat", "copy", "patternReplace"]);

	grunt.registerTask("default", ["build"]);
	grunt.registerTask("sync", ["build", "rsync:default"]);
	grunt.registerTask("archive", ["build", "compress"]);
};
