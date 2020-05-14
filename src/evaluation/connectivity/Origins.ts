//FIXME This breaks Kubernetes and docker-compose deployments. See README, section Environment variables, to see how these attributes are supposed to be configured.
export const PDS_HOST: string = "http://localhost:6080";
export const MQTT_HOST: string = "http://localhost:9001";