import {LinkModel} from "@projectstorm/react-diagrams-core";
import {expect} from "chai";
import React from "react";
import {ExistingConfigComponent} from "../ExistingConfig/existingConfigComponent";
import {ConvertStoryToGraph} from "../GraphView/ConfigJson";
import {DataGenerationNode} from "../GraphView/Nodes/DataGenerationNode";
import {Node} from "../GraphView/Nodes/Node";
import {RequestNode} from "../GraphView/Nodes/RequestNode";
import {StartNode} from "../GraphView/Nodes/StartNode";
import Enzyme, {mount, shallow} from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import XMLFixtures from "./fixtures/xml_fixtures";
import {GraphView, IState as GraphState, IProps as GraphProps} from "../GraphView/GraphView";
/*tslint:disable*/
function getFixture(): any {
    return JSON.parse("{\"name\":\"Rail\",\"scalePercentage\":1,\"atoms\":[{\"name\":\"Start\",\"id\":1,\"repeat\":1,\"successors\":[0],\"type\":\"START\",\"x\":23.993003498250875,\"y\":108.95052473763118},{\"name\":\"Warmup End\",\"id\":0,\"repeat\":1,\"successors\":[2],\"type\":\"WARMUP_END\",\"x\":164.52023988005996,\"y\":109.02598700649675},{\"name\":\"Delay\",\"id\":2,\"repeat\":1,\"successors\":[3,4],\"type\":\"DELAY\",\"x\":330,\"y\":97,\"delay\":\"100\"},{\"name\":\"Data Generation\",\"id\":4,\"repeat\":1,\"successors\":[5],\"type\":\"DATA_GENERATION\",\"x\":477.7661169415293,\"y\":174.9175412293853,\"table\":\"abcdef\",\"data\":[\"username\",\"password\"],\"dataToGenerate\":\"{\\\"value\\\":{\\\"username\\\":{\\\"attributes\\\":{\\\"maxChars\\\":\\\"10\\\"},\\\"__type\\\":\\\"RANDOM_STRING\\\"},\\\"password\\\":{\\\"attributes\\\":{\\\"maxChars\\\":\\\"20\\\"},\\\"__type\\\":\\\"RANDOM_STRING\\\"}}}\"},{\"name\":\"Request\",\"id\":5,\"repeat\":1,\"successors\":[],\"type\":\"REQUEST\",\"x\":760.6246876561719,\"y\":174.9175412293853,\"verb\":\"GET\",\"addr\":\"http://test.host\",\"requestJSONObject\":\"{\\\"user\\\":\\\"$username\\\"}\"},{\"name\":\"Delay\",\"id\":3,\"repeat\":1,\"successors\":[6],\"type\":\"DELAY\",\"x\":549.7301349325337,\"y\":51.97901049475263,\"delay\":\"1\"},{\"name\":\"Request\",\"id\":6,\"repeat\":1,\"successors\":[],\"type\":\"REQUEST\",\"x\":813.1959020489755,\"y\":61.04997501249374,\"verb\":\"GET\",\"addr\":\"http://test.host\"}]}");

}
function getFixtureWithRequestParams(): any {
    return JSON.parse("{\"repeat\":\"1\",\"scalePercentage\":\"70\",\"activeInstancesPerSecond\":\"30\",\"maximumConcurrentRequests\":\"50\",\"stories\":[{\"atoms\":[{\"id\":1,\"name\":\"Start\",\"repeat\":1,\"successors\":[0],\"type\":\"START\",\"x\":23.993003498250875,\"y\":108.95052473763118},{\"id\":0,\"name\":\"Warmup End\",\"repeat\":1,\"successors\":[2],\"type\":\"WARMUP_END\",\"x\":164.52023988005996,\"y\":109.02598700649675},{\"id\":2,\"name\":\"Delay\",\"repeat\":1,\"successors\":[3,4],\"type\":\"DELAY\",\"x\":330,\"y\":97,\"delay\":\"100\"},{\"id\":4,\"name\":\"Data Generation\",\"repeat\":1,\"successors\":[5],\"type\":\"DATA_GENERATION\",\"x\":477.7661169415293,\"y\":174.9175412293853,\"data\":[\"username\",\"password\"],\"dataToGenerate\":\"{\\\"value\\\":{\\\"username\\\":{\\\"attributes\\\":{\\\"maxChars\\\":\\\"10\\\"},\\\"__type\\\":\\\"RANDOM_STRING\\\"},\\\"password\\\":{\\\"attributes\\\":{\\\"maxChars\\\":\\\"20\\\"},\\\"__type\\\":\\\"RANDOM_STRING\\\"}}}\",\"table\":\"abcdef\"},{\"id\":5,\"name\":\"Request\",\"repeat\":1,\"successors\":[],\"type\":\"REQUEST\",\"x\":760.6246876561719,\"y\":174.9175412293853,\"addr\":\"http://test.host\",\"verb\":\"GET\",\"requestJSONObject\":\"{\\\"user\\\":\\\"$username\\\"}\"},{\"id\":3,\"name\":\"Delay\",\"repeat\":1,\"successors\":[6],\"type\":\"DELAY\",\"x\":549.7301349325337,\"y\":51.97901049475263,\"delay\":\"1\"},{\"id\":6,\"name\":\"Request\",\"repeat\":1,\"successors\":[],\"type\":\"REQUEST\",\"x\":813.1959020489755,\"y\":61.04997501249374,\"addr\":\"http://test.host\",\"verb\":\"GET\",\"requestParams\":[\"username\",\" password\"],\"responseJSONObject\":[\"username\",\" password\"]}],\"name\":\"Rail\",\"scalePercentage\":1}]}");

}

function getFixtureWithAssertions():any {
    return JSON.parse("{\"repeat\":\"1\",\"scaleFactor\":\"70\",\"activeInstancesPerSecond\":\"30\",\"maximumConcurrentRequests\":\"50\",\"stories\":[{\"atoms\":[{\"id\":1,\"name\":\"Start\",\"repeat\":1,\"successors\":[0],\"type\":\"START\",\"x\":10,\"y\":10},{\"id\":0,\"name\":\"Request\",\"repeat\":1,\"successors\":[],\"type\":\"REQUEST\",\"x\":371,\"y\":118.30000305175781,\"addr\":\"http://google.com\",\"verb\":\"GET\",\"assertions\":[{\"type\":\"RESPONSE_CODE\",\"_keyhandler\":{},\"name\":\"returns 200\",\"responseCode\":\"200\"},{\"type\":\"CONTENT_NOT_EMPTY\",\"_keyhandler\":{},\"name\":\"Google has something to tell us\"},{\"type\":\"CONTENT_TYPE\",\"_keyhandler\":{},\"name\":\"Google returns html\",\"contentType\":\"text/html; charset=UTF-8\"}]}],\"name\":\"enter story name\",\"scalePercentage\":1}]}");
}

Enzyme.configure({ adapter: new Adapter() });

describe("importer", () => {
    test("should find nodes", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {},new ExistingConfigComponent({}),getFixture());
        expect(nodes.nodes).to.not.be.empty;
    });
    test("should find exactly 7 nodes", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {},new ExistingConfigComponent({}),getFixture());
        expect(nodes.nodes.length).to.be.eq(7);
    });
    test("should find exactly 6 links", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {},new ExistingConfigComponent({}),getFixture());
        expect(nodes.links.length).to.be.eq(6);
    });
    test("should find start node", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {},new ExistingConfigComponent({}),getFixture());
        expect(nodes.startNode).to.not.be.null;
    });
    test("should find links", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {},new ExistingConfigComponent({}),getFixture());
        expect(nodes.startNode).to.not.be.empty;
    });
    test("should preserve Delay attributes", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {},new ExistingConfigComponent({}),getFixture());
        const delay: Node = nodes.nodes[2];
        expect(delay.getAttribute("delay")).to.be.eq("100");
    });
    test("should preserve DATA_GENERATION attributes", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {},new ExistingConfigComponent({}),getFixture());
        const gen: DataGenerationNode = nodes.nodes[3] as DataGenerationNode;
        expect(gen.dataToGenerate.value.get("username")!.getAttribute("maxChars")).to.eq("10");
        expect(gen.dataToGenerate.value.get("password")!.getAttribute("maxChars")).to.eq("20");
    });

    test("should preserve Request attributes", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {},new ExistingConfigComponent({}),getFixture());
        const req: RequestNode = nodes.nodes[4] as RequestNode;
        expect(req.getAttribute("verb")).to.eq("GET");
        expect(req.getAttribute("addr")).to.eq("http://test.host");
        expect(req.getAttribute("requestJSONObject")).to.eq("{\"user\":\"$username\"}");
    });

    test("should preserve Request params", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {},new ExistingConfigComponent({}),getFixtureWithRequestParams().stories[0]);
        const req: RequestNode = nodes.nodes[6] as RequestNode;
        console.log(req)
        expect(req.getAttribute("verb")).to.eq("GET");
        expect(req.getAttribute("addr")).to.eq("http://test.host");
        expect(req.getAttribute("requestParams")).to.eq("username, password");
    });

    test("should preserve responseJSONObject", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {},new ExistingConfigComponent({}),getFixtureWithRequestParams().stories[0]);
        const req: RequestNode = nodes.nodes[6] as RequestNode;
        expect(req.getAttribute("verb")).to.eq("GET");
        expect(req.getAttribute("addr")).to.eq("http://test.host");
        expect(req.getAttribute("responseJSONObject")).to.eq("username, password");
    });

    test("should preserve assertions", async () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {},new ExistingConfigComponent({}),getFixtureWithAssertions().stories[0]);
        const req: RequestNode = nodes.nodes[1] as RequestNode;
        console.log(req.getAttribute("assertions"))
        expect(req.getAttribute("assertions")[0].name).to.eq("returns 200");
        expect(req.getAttribute("assertions")[0].responseCode).to.eq("200");

        expect(req.getAttribute("assertions")[1].name).to.eq("Google has something to tell us");

        expect(req.getAttribute("assertions")[2].name).to.eq("Google returns html");
        expect(req.getAttribute("assertions")[2].contentType).to.eq("text/html; charset=UTF-8");
    });

    test("should give dataGeneration correct methods", async () => {
        let disable = false, enable = false;
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {
            disable = true
        }, () => {
            enable = true
        }, new ExistingConfigComponent({}), getFixture());
        const gen: DataGenerationNode = nodes.nodes[3] as DataGenerationNode;
        gen.keyhandler.disableDeleteKey();
        gen.keyhandler.enableDeleteKey();
        expect(disable).to.be.true;
        expect(enable).to.be.true


    })

    it("removes existing start node during import", () => {
        const existing = <ExistingConfigComponent/>;
        const existingWrapper = mount<{}, {}>(existing, {});
        const component = <GraphView existingConfig={existingWrapper.instance() as ExistingConfigComponent}/>;
        const wrapper = shallow<GraphView, GraphState>(component, {});
        (wrapper.instance() as GraphView).importNodes(XMLFixtures.getTestConfigWithExistingData().stories[0]);
        const nodes = (wrapper.instance() as GraphView).state.nodes;
        let startNodes = 0;
        for(let node of nodes){
            if(node.getAtomType() === "START"){
                startNodes ++
            }
        }
        expect(startNodes).to.eq(1)
    });

    });
