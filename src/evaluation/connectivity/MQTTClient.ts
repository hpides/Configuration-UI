import mqtt, { Packet } from "mqtt";
import { Statistic as ProtoStatistic } from "../statistic_pb";
import { Statistic } from "../Statistic/Statistic";
import { StatisticReceivedCallback, ControlReceivedCallback, ControlMessageType } from "./Messages";
import { MQTT_HOST } from "./Origins";

export class MQTTClient {

	private static readonly TimesTopic = "de.hpi.tdgt.times";
	private static readonly ControlTopic = "de.hpi.tdgt.control";

	private client: mqtt.Client;
	private statisticReceivedCallback: StatisticReceivedCallback;
	private controlReceivedCallback: ControlReceivedCallback;


	constructor(statisticReceivedCallback: StatisticReceivedCallback,
		controlReceivedCallback: ControlReceivedCallback) {

		this.statisticReceivedCallback = statisticReceivedCallback;
		this.controlReceivedCallback = controlReceivedCallback;

        this.client = mqtt.connect(MQTT_HOST)
		this.client.on("connect", () => {
			this.client.subscribe(MQTTClient.TimesTopic, { qos: 2 });
			this.client.subscribe(MQTTClient.ControlTopic, { qos: 2 });
		});

		this.client.on("message", this.onMessageReceived);
	}

	onMessageReceived = (topic: string, payload: Buffer, packet: Packet) => {
		switch (topic) {
			case MQTTClient.ControlTopic:
				const components = payload.toString().split(" ");

				if (components.length < 2)
					return;

				let msgType: ControlMessageType;
				if (components[0] === "testStart")
					msgType = "testStart";
				else if (components[0] === "testEnd")
					msgType = "testEnd";
				else
					msgType = "unknown";

				this.controlReceivedCallback(msgType, Number(components[1]));
				break;
            case MQTTClient.TimesTopic:
                const stats = new Statistic(
                    ProtoStatistic.deserializeBinary(new Uint8Array(payload)));
				this.statisticReceivedCallback(stats);
				break;
		}
    }

    public close() {
        this.client.end();
    }
}