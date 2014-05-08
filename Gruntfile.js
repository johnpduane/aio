module.exports = function (grunt) {

	var buildPath = "./dist";
	var assetsPath = buildPath + "/assets";

	grunt.initConfig({
		pkg        : grunt.file.readJSON("package.json"),
		localConfig: grunt.file.readJSON("localConfig.json"),
		"less"     : {
			"default": {
				"options": {
					"paths"      : "app/less",
					"yuicompress": true,
					"compress"   : false
				},
				"src"    : "app/less/main.less",
				"dest"   : assetsPath + "/css/screen.css"
			},
			"min"    : {
				"options": {
					"paths"      : "app/less",
					"yuicompress": true,
					"compress"   : true
				},
				"src"    : "<%= less.default.dest %>",
				"dest"   : assetsPath + "/css/screen.min.css"
			}
		},
		"concat"   : {
			"lib": {
				"src" : [
					"bower_components/jquery/dist/jquery.min.js",
					"bower_components/bootstrap/dist/js/bootstrap.min.js"
				],
				"dest": assetsPath + "/js/<%= pkg.name %>-lib.min.js"
			}
		},
		"copy"     : {
			"templates"  : {
				"expand": true,
				"cwd"   : "app/templates",
				"src"   : ["**/*.hbs"],
				"dest"  : buildPath + "/"
			},
			"images" : {
				"expand": true,
				"cwd"   : "app/images",
				"src"   : ["**/*.{png,jpeg,jpg}"],
				"dest"  : assetsPath + "/images"
			},
			"fonts": {
				"expand": true,
				"cwd"   : "app/fonts",
				"src"   : "**/*",
				"dest"  : assetsPath + "/fonts"
			},
			"fontawesome": {
				"expand": true,
				"cwd"   : "bower_components/fontawesome/fonts",
				"src"   : "**/*",
				"dest"  : assetsPath + "/fonts"
			},
			"package": {
				"src"   : "package.json",
				"dest"  : buildPath + "/"
			}
		},
		"rsync"    : {
			"default": {
				"options": {
					"src"      : buildPath + "/",
					"dest"     : "<%= localConfig.dest %>",
					"host"     : "<%= localConfig.host %>",
					"recursive": true,
					"syncDest" : true,
					"exclude"  : [".git*"]
				}
			},
			"watch": {
				"options": {
					"src"      : buildPath + "/",
					"dest"     : "<%= localConfig.dest %>",
					"host"     : "<%= localConfig.host %>",
					"recursive": true,
					"syncDest" : false,
					"exclude"  : [".git*"]
				}
			}
		},
		"clean"    : {
			"default": [ buildPath ]
		},
		"watch"    : {
			"options": {
				"livereload": true
			},
			"hbs"   : {
				"files": ["app/templates*/**/*.hbs"],
				"tasks": ["clean", "copy:templates", "rsync:watch"]
			},
			"css"    : {
				"files": ["app/less/**/*.less"],
				"tasks": ["clean", "less", "rsync:watch"]
			},
			"js"     : {
				"files": ["app/js/**/*.js"],
				"tasks": ["clean", "concat", "rsync:watch"]
			}
		}
	});

	// Register tasks
	grunt.loadNpmTasks("grunt-rsync");
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-concat');
	//grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask("build", ["clean", "less", "concat", "copy"]);

	grunt.registerTask("default", ["build"]);
	grunt.registerTask("sync", ["build", "rsync:default"]);
};
