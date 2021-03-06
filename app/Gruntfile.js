module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        buildTimestamp: (new Date()).toISOString().slice(0,10).replace(/-/g,"") + '.' + (new Date()).toISOString().slice(11,16).replace(/:/g,""),
       
        meta: {
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },

        ember_handlebars: {
            compile: {
                options: {
                    processName: function(filePath) {
                        return filePath.replace('web/templates/', '').split('.')[0];
                    }
                },
                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: 'web/templates/',      // Src matches are relative to this path.
                        src: ['**/*.hbs'], // Actual pattern(s) to match.
                        dest: 'web/build/handlebars/',   // Destination path prefix.
                        ext: '.js'   // Dest filepaths will have this extension.
                    }
                ]
            }
        },

        concat: {
            library:{
                src:[
                    'web/libs/jquery.min.js',
                    'web/libs/handlebars-1.1.2.js',
                    'web/libs/ember-1.3.2.js'
                    ],
                dest:'dist/web/scripts/libs.js'
            },
            application: {
                src: [
                    'web/build/handlebars/**/*.js',
                    'web/scripts/app/app.js',
                    'web/scripts/app/components/*.js',
                    'web/scripts/modules/**/*.js'
                ],
                dest:'dist/web/scripts/app.js'
            },
            cssOutput: {
                src: [
                    'web/build/css/*.css'
                ],
                dest: 'dist/web/stylesheets/styles.css'
            }
        },

        compass: {
            prod: {
                options: {
                    config: 'config.rb'
                }
            }
        },
      
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: '.',
                        src: [
                            'server/server.js',
                            'package.json',
                            'Procfile'
                        ],
                        dest: 'dist/'
                    },
                    {
                        expand: true,
                        cwd: 'server',
                        src: [
                            'server.js'
                        ],
                        dest: 'dist'
                    },
                    {
                        expand: true,
                        cwd: 'server/config',
                        src: ['**'],
                        dest: 'dist/config'
                    },
                    {
                        expand: true,
                        cwd: 'server/constants',
                        src: ['**'],
                        dest: 'dist/constants'
                    },
                    {
                        expand: true,
                        cwd: 'server/controllers',
                        src: ['**'],
                        dest: 'dist/controllers'
                    },
                    {
                        expand: true,
                        cwd: 'server/routes',
                        src: ['**'],
                        dest: 'dist/routes'
                    },
                    {
                        expand: true,
                        cwd: 'web',
                        src: ['**', '!libs/**', '!scripts/**', '!stylesheets/**', '!templates/**'],
                        dest: 'dist/web'
                    }
                ]
            }
        },
        clean: {
            removedist: ["dist/"],
            removescss: ["web/stylesheets/css", "dist/web/stylesheets/*.scss"],
            removehbs: ["web/templates/js", "dist/web/templates/html"]
        },

        replace: {
            common: {
                options: {
                    variables: {
                        'buildTimestamp' : '<%= buildTimestamp %>'
                    },
                    prefix: '@@'
                },
                files : {
                    'dist/constants/index.js' : [ 'dist/constants/index.js' ]
                }
            },
            dev: {
                options: {
                    variables: {
                        'activeConfig': 'dev'
                    },
                    prefix: '@@'
                },
                files : {
                    'dist/config/index.js' : [ 'dist/config/index.js' ]
                }
            },
            prod: {
                options: {
                    variables: {
                        'activeConfig': 'prod'
                    },
                    prefix: '@@'
                },
                files : {
                    'dist/config/index.js' : [ 'dist/config/index.js' ]
                }
            }
        },

        shell: {
            runNodeServer: {
                command: 'node server.js',
                options: {                      // Options
                    stdout: true,
                    execOptions: {
                        'cwd': 'dist'
                    }
                },
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-ember-handlebars');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('common', [
        'clean:removedist',
        'copy:build',
        'ember_handlebars',
        'concat',
        'compass',
        'concat:cssOutput',
        'replace:common',
        // 'clean:removescss',
        // 'clean:removehbs'
    ]);

    grunt.registerTask('default', [
        'common',
        'replace:dev',
        'shell:runNodeServer'
    ]);

    grunt.registerTask('prod', [
        'common',
        'replace:prod'
    ]);
};