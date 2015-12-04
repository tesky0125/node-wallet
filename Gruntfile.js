/**
 * Imigrate route from .net to node.js.
 * Translate views/res to node.js format.
 * Usage:
 * 1.Download node-wallet from git@git.dev.sh.ctripcorp.com:rylan_yan/node-wallet.git 
 * 2.Put node-wallet in Wallet_WebApp
 * 3.Move Gruntfile.js and package.json.bak from node-wallet to Wallet_WebApp, and rename package.json.bak to package.json 
 * 4.run `npm install` and `grunt` in Wallet_WebApp
 * 5.run `npm start` to start node-express
 */
module.exports = function(grunt) {
	require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);

	//task translate: translate cshtml mate to ejs mate.
	grunt.registerTask('translate', function(){
        grunt.config(
            'clean', {
                'node-wallet': ["node-wallet/views/*","node-wallet/res/*"]
            });
		grunt.config(
            'copy', {
                views: {
                    expand: true,
                    flatten: false,
                    cwd: 'Wallet/Views/Wallet/',
                    src: '*.cshtml',
                    dest: 'node-wallet/views/',
                    ext: '.html',
                    options: {
                        process: function(contents, srcpath) {
                            console.log(srcpath);
                            contents = contents.replace("@using System.Configuration","<% layout('layout.html') -%>")
                        					.replace("@ConfigurationManager.AppSettings[\"cdnUrl\"]","");
                            return contents;
                        }
                    },
                    filter: 'isFile'
                },
                res:{
                    expand: true,
                    flatten: false,
                    cwd: 'Wallet/Res/',
                    src: '**',
                    dest: 'node-wallet/res/',
                    options: {
                        processContentExclude: ['**/*.{png,jpg}'],
                        process: function(contents, srcpath) {
                            console.log(srcpath);
                            return contents;
                        }
                    },
                },
                layout:{
                    src: 'Wallet/Views/Shared/_Layout.cshtml',
                    dest: 'node-wallet/views/layout.html',
                    options: {
                        process: function(contents, srcpath) {
                            console.log(srcpath);
                            contents = contents.replace("@using System.Configuration","")
                                            .replace(/@ConfigurationManager.AppSettings\["cdnUrl"\]/g,"")
                                            .replace("@Url.Content(\"~/\")","/webapp/wallet/")
                                            .replace("@ConfigurationManager.AppSettings[\"WebresourceBaseUrl\"]","/")
                                            .replace("@ConfigurationManager.AppSettings[\"WebresourcePDBaseUrl\"]","/webapp/wallet/")
                                            .replace("@ConfigurationManager.AppSettings[\"restfullApi\"]","localhost")
                                            .replace("@RenderBody()","<%- body %>")
                                            .replace(/@{\s*?\n\s*?var\s*?now.*?;\s*?\n\s*}/g,"")
                                            .replace(/var.*?__SERVERDATE__.*?}/g,"")
                                            .replace("@ConfigurationManager.AppSettings[\"lizardUrl\"]","//webresource.c-ctrip.com/code/lizard/2.1/web/lizard.seed.js")
                                            .replace("@ConfigurationManager.AppSettings[\"restfullApi\"]","localhost");
                            return contents;
                        }
                    }             
                },
                error:{
                   src: 'Wallet/Views/Shared/Error.cshtml',
                    dest: 'node-wallet/views/error.html',
                    options: {
                        process: function(contents, srcpath) {
                            console.log(srcpath);
                            contents = contents.replace(/@{\s*?\n\s*?Layout.*?;\s*?\n\s*}/g,"");
                            return contents;
                        }
                    }              
                }
            });

		grunt.task.run(['clean:node-wallet','copy:views','copy:res','copy:layout','copy:error']);
	});

    grunt.registerTask('default', ['translate']);	

};