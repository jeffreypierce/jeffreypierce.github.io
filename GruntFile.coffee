module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    coffee:
      dist:
        options:
          join: true
        files:
          'app.js': [
            'app/scripts/utils.coffee'
            'app/scripts/coloring.coffee'
          ]

    jade:
      dist:
        options:
          data:
            debug: false
        files:
          'index.html': ['app/views/index.jade']
    sass:
      dist:
        options:
          outputStyle: 'compressed'
          includePaths: []
        files:
          'app.css': 'app/styles/app.scss'

    copy:
      dist:
        files: [
          expand: true
          cwd: 'app/'
          src: ['assets/**']
          dest: ''
          filter: 'isFile'
        ]


    watch:
      tasks: ['coffee', 'jade', 'sass']
      files: [
          'app/**/*'
        ]
      options:
        livereload: true

    # uglify:
    #   my_target:
    #     files:
    #       'dist/vendor.min.js': ['bower_components/zepto/zepto.min.js']

    connect:
      server:
        options:
          port: 8888
          base: ''


  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-jade'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-sass'

  grunt.registerTask 'default', ['coffee', 'jade', 'sass', 'copy']
  grunt.registerTask 'server', ['connect', 'copy', 'watch']
