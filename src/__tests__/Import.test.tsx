import {LinkModel} from "@projectstorm/react-diagrams-core";
import {expect} from "chai";
import React from "react";
import {ConvertStoryToGraph} from "../GraphView/ConfigJson";
import {DataGenerationNode} from "../GraphView/Nodes/DataGenerationNode";
import {Node} from "../GraphView/Nodes/Node";
import {RequestNode} from "../GraphView/Nodes/RequestNode";
import {StartNode} from "../GraphView/Nodes/StartNode";
/*tslint:disable*/
function getFixture(): string {
    return JSON.parse("{\"name\":\"Rail\",\"scalePercentage\":1,\"atoms\":[{\"name\":\"Start\",\"id\":1,\"repeat\":1,\"successors\":[0],\"type\":\"START\",\"x\":23.993003498250875,\"y\":108.95052473763118},{\"name\":\"Warmup End\",\"id\":0,\"repeat\":1,\"successors\":[2],\"type\":\"WARMUP_END\",\"x\":164.52023988005996,\"y\":109.02598700649675},{\"name\":\"Delay\",\"id\":2,\"repeat\":1,\"successors\":[3,4],\"type\":\"DELAY\",\"x\":330,\"y\":97,\"delay\":\"100\"},{\"name\":\"Data Generation\",\"id\":4,\"repeat\":1,\"successors\":[5],\"type\":\"DATA_GENERATION\",\"x\":477.7661169415293,\"y\":174.9175412293853,\"table\":\"abcdef\",\"data\":[\"username\",\"password\"],\"dataToGenerate\":\"{\\\"value\\\":{\\\"username\\\":{\\\"attributes\\\":{\\\"maxChars\\\":\\\"10\\\"},\\\"__type\\\":\\\"RANDOM_STRING\\\"},\\\"password\\\":{\\\"attributes\\\":{\\\"maxChars\\\":\\\"20\\\"},\\\"__type\\\":\\\"RANDOM_STRING\\\"}}}\"},{\"name\":\"Request\",\"id\":5,\"repeat\":1,\"successors\":[],\"type\":\"REQUEST\",\"x\":760.6246876561719,\"y\":174.9175412293853,\"verb\":\"GET\",\"addr\":\"http://test.host\",\"requestJSONObject\":\"{\\\"user\\\":\\\"$username\\\"}\"},{\"name\":\"Delay\",\"id\":3,\"repeat\":1,\"successors\":[6],\"type\":\"DELAY\",\"x\":549.7301349325337,\"y\":51.97901049475263,\"delay\":\"1\"},{\"name\":\"Request\",\"id\":6,\"repeat\":1,\"successors\":[],\"type\":\"REQUEST\",\"x\":813.1959020489755,\"y\":61.04997501249374,\"verb\":\"GET\",\"addr\":\"http://test.host\"}]}");

}

describe("importer", () => {
    console.log(getFixture());
    test("should find nodes", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(getFixture());
        expect(nodes.nodes).to.not.be.empty;
    });
    test("should find exactly 7 nodes", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(getFixture());
        expect(nodes.nodes.length).to.be.eq(7);
    });
    test("should find exactly 6 links", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(getFixture());
        expect(nodes.links.length).to.be.eq(6);
    });
    test("should find start node", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(getFixture());
        expect(nodes.startNode).to.not.be.null;
    });
    test("should find links", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(getFixture());
        expect(nodes.startNode).to.not.be.empty;
    });
    test("should preserve Delay attributes", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(getFixture());
        const delay: Node = nodes.nodes[2];
        expect(delay.getAttribute("delay")).to.be.eq("100");
    });
    test("should preserve DATA_GENERATION attributes", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(getFixture());
        const gen: DataGenerationNode = nodes.nodes[3] as DataGenerationNode;
        expect(gen.dataToGenerate.value.get("username")!.getAttribute("maxChars")).to.eq("10");
        expect(gen.dataToGenerate.value.get("password")!.getAttribute("maxChars")).to.eq("20");
    });

    test("should preserve Request attributes", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(getFixture());
        const req: RequestNode = nodes.nodes[4] as RequestNode;
        expect(req.getAttribute("verb")).to.eq("GET");
        expect(req.getAttribute("addr")).to.eq("http://test.host");
        expect(req.getAttribute("requestJSONObject")).to.eq("{\"user\":\"$username\"}");
    });
});
