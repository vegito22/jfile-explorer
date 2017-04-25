# jfile-explorer
Simple Juniper Extension Toolkit (JET) app to get a file explorer in your browser

## Configuration
  Copy files to /var/run/scripts/jet/ folder
  Configure server.py under extension-services (Check Developing JET App with Junos)
  Configuration
  user@router# show system extensions
  extension-service {
    application {
        file server.py;
    }
  }

## Run the application
In the operational mode from the CLI invoke
request extension-service start server.py
This should start the server on the default port 8080

## Example

![](https://media.giphy.com/media/LoUMSSbj3NtLy/giphy.gif)
