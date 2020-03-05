import {ExistingConfigComponent, IState} from "../../ExistingConfig/existingConfigComponent";
import {shallow} from "enzyme";

export default class XMLFixtures{
    public static getCustomerXML():string{
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
            "<!--  <!DOCTYPE schema SYSTEM \"structure/pdgfSchema.dtd\">-->\n" +
            "\n" +
            "<!--\n" +
            "/*******************************************************************************\n" +
            " * Copyright (c) 2013, bankmark and/or its affiliates. All rights reserved.\n" +
            " * bankmark UG PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.\n" +
            " *\n" +
            " *\n" +
            " ******************************************************************************/\n" +
            "-->\n" +
            "<schema name=\"demo\"  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:noNamespaceSchemaLocation=\"structure/pdgfSchema.xsd\">\n" +
            "\n" +
            "\t<!-- All data is derived from this starting seed.\n" +
            "\tIf this seed is the same, the generated data will the same on each computer/node/platform.\n" +
            "\tChange this seed to generate a different data set.-->\n" +
            "\t<seed>1234567890</seed>\n" +
            "\n" +
            "\t<rng name=\"PdgfDefaultRandom\"/>\n" +
            "\n" +
            "\t<!--Default Scale factor for all tables -->\n" +
            "\t<property name=\"SF\" type=\"double\">10000</property>\n" +
            "\t<property name=\"Users\" type=\"double\">0.7 * ${SF}</property>\n" +
            "\t<property name=\"Posts\" type=\"double\">0.7 * ${SF}</property>\n" +
            "\t<property name=\"search\" type=\"double\">0.3 * ${SF}</property>\n" +
            "\t<!-- ============================== -->\n" +
            "\n" +
            "\t<table name=\"Users\">\n" +
            "\t\t<!-- if tables should scale with -SF command line argument. Specify your scaling formula here: -->\n" +
            "\t\t<size>${Users}</size>\n" +
            "\t\t<field name=\"username\" type=\"VARCHAR\" primary=\"true\" unique=\"true\">\n" +
            "\t\t\t<gen_FormatString>\n" +
            "\t\t\t\t<format>%s.%s</format>\n" +
            "\t\t\t\t<gen_DictList id=\"FamilyNameGen\">\n" +
            "\t\t\t\t\t<file>dicts/Family-Names.dict</file>\n" +
            "\t\t\t\t\t<disableRng>true</disableRng>\n" +
            "\t\t\t\t</gen_DictList>\n" +
            "\t\t\t\t<gen_DictList id=\"FirstNameGen\">\n" +
            "\t\t\t\t\t<file>dicts/Given-Names.dict</file>\n" +
            "\t\t\t\t\t<disableRng>true</disableRng>\n" +
            "\t\t\t\t</gen_DictList>\n" +
            "        </gen_FormatString>\n" +
            "\t\t</field>\n" +
            "\t\t<field name=\"Passwort\" type=\"VARCHAR\">\n" +
            "\t\t\t\t<gen_RandomString>\n" +
            "\t\t\t\t<max>16</max>\n" +
            "\t        </gen_RandomString>\n" +
            "\t\t</field>\n" +
            "\t</table>\n" +
            "\n" +
            "\t<table name=\"Posts\">\n" +
            "\t\t<size>${Posts}</size>\n" +
            "\t\t<field name=\"title\" type=\"VARCHAR\">\n" +
            "\t\t\t<!-- Generiert mit  java7 -cp pdgf.jar pdgf.util.text.MarkovChainBuilder -n 4 LICENSE.txt dicts/markovExample/Food.bin 2538.-->\n" +
            "\t\t\t<gen_MarkovChainText>\n" +
            "\t\t\t\t\t\t<min>2</min><max>50</max>\n" +
            "\t\t\t\t\t\t<file>dicts/markovExample/Books_Literature_Fiction.bin</file>\n" +
            "\t\t\t</gen_MarkovChainText>\n" +
            "\t\t</field>\n" +
            "\t\t<field name=\"text\" type=\"VARCHAR\">\n" +
            "\t\t\t<!-- Generiert mit  java7 -cp pdgf.jar pdgf.util.text.MarkovChainBuilder -n 4 LICENSE.txt dicts/markovExample/Food.bin 2538.-->\n" +
            "\t\t\t<gen_MarkovChainText>\n" +
            "\t\t\t\t\t\t<min>10</min><max>2000</max>\n" +
            "\t\t\t\t\t\t<file>dicts/markovExample/Electronics_Camera_Photo.bin</file>\n" +
            "\t\t\t</gen_MarkovChainText>\n" +
            "\t\t</field>\n" +
            "\t</table>\n" +
            "\n" +
            "\t<table name=\"Search\">\n" +
            "\t\t<size>${search}</size>\n" +
            "\t\t<field name=\"Benutzer\" type=\"VARCHAR\">\n" +
            "\t\t\t<gen_ReferenceValue choose=\"random\" from=\"historical\" id='SearchGenerator1'>\n" +
            "\t\t\t\t<reference field=\"text\" table=\"Posts\"/>\n" +
            "\t\t\t</gen_ReferenceValue>\n" +
            "\t\t</field>\n" +
            "\t</table>\n" +
            "\n" +
            "</schema>";
}

}

it("returns no empty string", () => {

    expect(XMLFixtures.getCustomerXML()).not.toEqual("")
});