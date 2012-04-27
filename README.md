This Rakefile can be used to create a skeleton Rally app for use with Rally's App SDK and the Analytics API.  You must have Ruby and the rake gem installed.

Available tasks are:

    rake build                      # Build a deployable app which includes all JavaScript and CSS resources inline
    rake clean                      # Clean all generated output
    rake debug                      # Build a debug version of the app, useful for local development
    rake jslint                     # Run jslint on all JavaScript files used by this app
    rake new[app_name,sdk_version]  # Create an app with the provided name (and optional SDK version)
    
You can find more information on installing Ruby and using rake tasks to simplify app development here: https://rally1.rallydev.com/apps/2.0p/doc/#!/guide/appsdk_20_starter_kit

To launch chrome with cross-origin checks and file checks disabled, on windows it will look something like:
Google Chrome.exe --disable-web-security --allow-file-access-from-files

On mac:
cd /Applications
open Google\ Chrome.app --args --disable-web-security --allow-file-access-from-files
