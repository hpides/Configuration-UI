import React from 'react';
import {ExistingConfigComponent, IState, IUploadedFile} from "../ExistingConfig/existingConfigComponent";
import  XMLFixtures from "./fixtures/xml_fixtures";

import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';


Enzyme.configure({ adapter: new Adapter() });
describe("The ExistingConfigComponent", () => {
    it("starts with an empty array", () => {
        const component = <ExistingConfigComponent/>;
        const wrapper = shallow<ExistingConfigComponent, IState>(component, {});
        expect(wrapper.instance().state.uploadedFiles).toEqual(new Map<string, IUploadedFile>())
    });

    it("reads the correct tables from the XML", () => {
        const component = <ExistingConfigComponent/>;
        const wrapper = shallow<ExistingConfigComponent, IState>(component, {});
        wrapper.instance().processFileContents(XMLFixtures.getCustomerXML(), "customer.xml");
        expect(wrapper.instance().state.uploadedFiles.get("customer.xml")!.existingTables).toEqual(["Users", "Posts", "Search"])
    });

    it("reads the correct fields from the XML", () => {
        const component = <ExistingConfigComponent/>;
        const wrapper = shallow<ExistingConfigComponent, IState>(component, {});
        wrapper.instance().processFileContents(XMLFixtures.getCustomerXML(), "customer.xml");
        expect(wrapper.instance().state.uploadedFiles.get("customer.xml")!.tableMapping.get("Users")).toEqual(["username", "Passwort"]);
        expect(wrapper.instance().state.uploadedFiles.get("customer.xml")!.tableMapping.get("Posts")).toEqual(["title", "text"]);
        expect(wrapper.instance().state.uploadedFiles.get("customer.xml")!.tableMapping.get("Search")).toEqual(["Benutzer"])
    });

    it("reports back to the user correctly", () => {
        const component = <ExistingConfigComponent/>;
        const wrapper = shallow<ExistingConfigComponent, IState>(component, {});
        wrapper.instance().processFileContents(XMLFixtures.getCustomerXML(), "customer.xml");
        expect(wrapper.text().includes("Table: Users, Fields: username, Passwort")).toBe(true);
        expect(wrapper.text().includes("Table: Posts, Fields: title, text")).toBe(true);
        expect(wrapper.text().includes("Table: Search, Fields: Benutzer")).toBe(true);
    });
});