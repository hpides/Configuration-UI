docker run -p 3000:3000 --rm --name configui -e REACT_APP_MQTT_HOST=users -e REACT_APP_PDS_HOST=users:8080 -e REACT_APP_REQGEN_HOST=localhost:8080 configui
