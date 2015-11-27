module.exports = function(grunt) {
	require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);

	//task translate: translate cshtml mate to ejs mate.
	grunt.registerTask('translate', function(){
		grunt.config(
            'copy', {
                translate: {
                    expand: true,
                    flatten: false,
                    cwd: 'views/',
                    src: '*.cshtml',
                    dest: 'views/',
                    ext: '.html',
                    options: {
                        process: function(contents, srcpath) {
                            contents = contents.replace("@using System.Configuration","<% layout('layout.html') -%>")
                            					.replace("@ConfigurationManager.AppSettings[\"cdnUrl\"]","");
                            return contents;
                        }
                    },
                    filter: 'isFile'
                }
            });
		grunt.config(
			'clean', {
				cshtml: ["views/*.cshtml"]
			});
		grunt.task.run(['copy:translate','clean:cshtml']);
	});

    grunt.registerTask('default', ['translate']);	

};