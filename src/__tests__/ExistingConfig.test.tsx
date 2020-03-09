import React from "react";
import {ExistingConfigComponent, IState, IUploadedFile} from "../ExistingConfig/existingConfigComponent";
import XMLFixtures from "./fixtures/xml_fixtures";

import {LinkModel} from "@projectstorm/react-diagrams";
import Enzyme, { mount, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import App, {IState as AppState} from "../App";
import {ConvertStoryToGraph} from "../GraphView/ConfigJson";
import {Node} from "../GraphView/Nodes/Node";
import {StartNode} from "../GraphView/Nodes/StartNode";

Enzyme.configure({ adapter: new Adapter() });
//tslint:disable
describe("The ExistingConfigComponent", () => {
    it("starts with an empty array", () => {
        const component = <ExistingConfigComponent/>;
        const wrapper = shallow<ExistingConfigComponent, IState>(component, {});
        expect(wrapper.instance().state.uploadedFiles).toEqual(new Map<string, IUploadedFile>());
    });

    it("reads the correct tables from the XML", () => {
        const component = <ExistingConfigComponent/>;
        const wrapper = shallow<ExistingConfigComponent, IState>(component, {});
        wrapper.instance().processFileContents(XMLFixtures.getCustomerXML(), "customer.xml");
        expect(wrapper.instance().state.uploadedFiles.get("customer.xml")!.existingTables).toEqual(["Users", "Posts", "Search"]);
    });

    it("reads the correct fields from the XML", () => {
        const component = <ExistingConfigComponent/>;
        const wrapper = shallow<ExistingConfigComponent, IState>(component, {});
        wrapper.instance().processFileContents(XMLFixtures.getCustomerXML(), "customer.xml");
        expect(wrapper.instance().state.uploadedFiles.get("customer.xml")!.tableMapping.get("Users")).toEqual(["username", "Passwort"]);
        expect(wrapper.instance().state.uploadedFiles.get("customer.xml")!.tableMapping.get("Posts")).toEqual(["title", "text"]);
        expect(wrapper.instance().state.uploadedFiles.get("customer.xml")!.tableMapping.get("Search")).toEqual(["Benutzer"]);
    });

    it("reports back to the user correctly", () => {
        const component = <ExistingConfigComponent/>;
        const wrapper = shallow<ExistingConfigComponent, IState>(component, {});
        wrapper.instance().processFileContents(XMLFixtures.getCustomerXML(), "customer.xml");
        expect(wrapper.text().includes("Table: Users, Fields: username, Passwort")).toBe(true);
        expect(wrapper.text().includes("Table: Posts, Fields: title, text")).toBe(true);
        expect(wrapper.text().includes("Table: Search, Fields: Benutzer")).toBe(true);
    });

    it("shows an error message", () => {
        const component = <ExistingConfigComponent/>;
        const wrapper = mount<ExistingConfigComponent, IState>(component, {});
        wrapper.instance().processFileContents("Nothing to see here", "customer.xml");
        expect(wrapper.instance().state.lastError).not.toBe("");
    });

    it("imports uploaded XMLs from test config", () => {
        const component = <App/>;
        const wrapper = mount<App, AppState>(component, {});
        wrapper.instance().import(XMLFixtures.getTestConfigWithUploadedFiles());
        const existingConfig = wrapper.instance().state.existingConfigComponent!.state;
        expect(existingConfig.allTables).toEqual(new Set<String>(["Users", "Posts", "Search", "Customer", "Account"]));
        expect(existingConfig.lastError).toEqual("");
        expect(existingConfig.uploadedFiles.get("customer.xml")!.existingTables).toEqual(["Users", "Posts", "Search"]);
        expect(existingConfig.uploadedFiles.get("customer.xml")!.tableMapping.get("Users")!).toEqual(["username", "Passwort"]);
    });

    it("preserves order", () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {}, new ExistingConfigComponent({}), XMLFixtures.getTestConfigWithExistingData().stories[0]);
        expect(nodes.nodes[2].getAttribute("data")).toEqual(["title", "text"])
    });

    it("uses the correct table name", () => {
        const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(() => {}, () => {}, new ExistingConfigComponent({}), XMLFixtures.getTestConfigWithExistingData().stories[0]);
        expect(nodes.nodes[2].getAttribute("table")).toEqual("Users")
    });
});
