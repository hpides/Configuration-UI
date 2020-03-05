import React from 'react';
import {ExistingConfigComponent, IState} from "../ExistingConfig/existingConfigComponent";
import  XMLFixtures from "./fixtures/xml_fixtures";

import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';


Enzyme.configure({ adapter: new Adapter() });

it("starts with an empty array", () => {
    const component = <ExistingConfigComponent />;
    const wrapper = shallow<ExistingConfigComponent, IState>(component, {});
    expect(wrapper.instance().state.existingTables).toEqual([])
});

it("reads the correct tables from the XML", () => {
    const component = <ExistingConfigComponent />;
    const wrapper = shallow<ExistingConfigComponent, IState>(component, {});
    wrapper.instance().processFileContents(XMLFixtures.getCustomerXML());
    expect(wrapper.instance().state.existingTables).toEqual(["Users", "Posts", "Search"])
});

it("reads the correct fields from the XML", () => {
    const component = <ExistingConfigComponent />;
    const wrapper = shallow<ExistingConfigComponent, IState>(component, {});
    wrapper.instance().processFileContents(XMLFixtures.getCustomerXML());
    expect(wrapper.instance().state.tableMapping.get("Users")).toEqual(["username","Passwort"]);
    expect(wrapper.instance().state.tableMapping.get("Posts")).toEqual(["title","text"]);
    expect(wrapper.instance().state.tableMapping.get("Search")).toEqual(["Benutzer"])
});