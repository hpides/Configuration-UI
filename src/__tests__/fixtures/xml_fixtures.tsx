import {shallow} from "enzyme";
import {ExistingConfigComponent, IState} from "../../ExistingConfig/existingConfigComponent";

export default class XMLFixtures {
    public static getCustomerXML(): string {
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

public static getTestConfigWithUploadedFiles() {
        return JSON.parse("{\n" +
            "    \"repeat\": \"1\",\n" +
            "    \"scaleFactor\": \"20000\",\n" +
            "    \"activeInstancesPerSecond\": \"100\",\n" +
            "    \"maximumConcurrentRequests\": \"10\",\n" +
            "    \"stories\": [],\n" +
            "    \"existingXMLs\": {\n" +
            "        \"uploadedFiles\": {\n" +
            "            \"customer.xml\": {\n" +
            "                \"fileContent\": \"<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\\n<!--  <!DOCTYPE schema SYSTEM \\\"structure/pdgfSchema.dtd\\\">-->\\n\\n<!--\\n/*******************************************************************************\\n * Copyright (c) 2013, bankmark and/or its affiliates. All rights reserved.\\n * bankmark UG PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.\\n *\\n *\\n ******************************************************************************/\\n-->\\n<schema name=\\\"demo\\\"  xmlns:xsi=\\\"http://www.w3.org/2001/XMLSchema-instance\\\" xsi:noNamespaceSchemaLocation=\\\"structure/pdgfSchema.xsd\\\">\\n\\n\\t<!-- All data is derived from this starting seed.\\n\\tIf this seed is the same, the generated data will the same on each computer/node/platform.\\n\\tChange this seed to generate a different data set.-->\\n\\t<seed>1234567890</seed>\\n\\n\\t<rng name=\\\"PdgfDefaultRandom\\\"/>\\n\\n\\t<!--Default Scale factor for all tables -->\\n\\t<property name=\\\"SF\\\" type=\\\"double\\\">10000</property>\\n\\t<property name=\\\"Users\\\" type=\\\"double\\\">0.7 * ${SF}</property>\\n\\t<property name=\\\"Posts\\\" type=\\\"double\\\">0.7 * ${SF}</property>\\n\\t<property name=\\\"search\\\" type=\\\"double\\\">0.3 * ${SF}</property>\\n\\t<!-- ============================== -->\\n\\n\\t<table name=\\\"Users\\\">\\n\\t\\t<!-- if tables should scale with -SF command line argument. Specify your scaling formula here: -->\\n\\t\\t<size>${Users}</size>\\n\\t\\t<field name=\\\"username\\\" type=\\\"VARCHAR\\\" primary=\\\"true\\\" unique=\\\"true\\\">\\n\\t\\t\\t<gen_FormatString>\\n\\t\\t\\t\\t<format>%s.%s</format>\\n\\t\\t\\t\\t<gen_DictList id=\\\"FamilyNameGen\\\">\\n\\t\\t\\t\\t\\t<file>dicts/Family-Names.dict</file>\\n\\t\\t\\t\\t\\t<disableRng>true</disableRng>\\n\\t\\t\\t\\t</gen_DictList>\\n\\t\\t\\t\\t<gen_DictList id=\\\"FirstNameGen\\\">\\n\\t\\t\\t\\t\\t<file>dicts/Given-Names.dict</file>\\n\\t\\t\\t\\t\\t<disableRng>true</disableRng>\\n\\t\\t\\t\\t</gen_DictList>\\n        </gen_FormatString>\\n\\t\\t</field>\\n\\t\\t<field name=\\\"Passwort\\\" type=\\\"VARCHAR\\\">\\n\\t\\t\\t\\t<gen_RandomString>\\n\\t\\t\\t\\t<max>16</max>\\n\\t        </gen_RandomString>\\n\\t\\t</field>\\n\\t</table>\\n\\n\\t<table name=\\\"Posts\\\">\\n\\t\\t<size>${Posts}</size>\\n\\t\\t<field name=\\\"title\\\" type=\\\"VARCHAR\\\">\\n\\t\\t\\t<!-- Generiert mit  java7 -cp pdgf.jar pdgf.util.text.MarkovChainBuilder -n 4 LICENSE.txt dicts/markovExample/Food.bin 2538.-->\\n\\t\\t\\t<gen_MarkovChainText>\\n\\t\\t\\t\\t\\t\\t<min>2</min><max>50</max>\\n\\t\\t\\t\\t\\t\\t<file>dicts/markovExample/Books_Literature_Fiction.bin</file>\\n\\t\\t\\t</gen_MarkovChainText>\\n\\t\\t</field>\\n\\t\\t<field name=\\\"text\\\" type=\\\"VARCHAR\\\">\\n\\t\\t\\t<!-- Generiert mit  java7 -cp pdgf.jar pdgf.util.text.MarkovChainBuilder -n 4 LICENSE.txt dicts/markovExample/Food.bin 2538.-->\\n\\t\\t\\t<gen_MarkovChainText>\\n\\t\\t\\t\\t\\t\\t<min>10</min><max>2000</max>\\n\\t\\t\\t\\t\\t\\t<file>dicts/markovExample/Electronics_Camera_Photo.bin</file>\\n\\t\\t\\t</gen_MarkovChainText>\\n\\t\\t</field>\\n\\t</table>\\n\\n\\t<table name=\\\"Search\\\">\\n\\t\\t<size>${search}</size>\\n\\t\\t<field name=\\\"Benutzer\\\" type=\\\"VARCHAR\\\">\\n\\t\\t\\t<gen_ReferenceValue choose=\\\"random\\\" from=\\\"historical\\\" id='SearchGenerator1'>\\n\\t\\t\\t\\t<reference field=\\\"text\\\" table=\\\"Posts\\\"/>\\n\\t\\t\\t</gen_ReferenceValue>\\n\\t\\t</field>\\n\\t</table>\\n\\n</schema>\\n\",\n" +
            "                \"existingTables\": [\n" +
            "                    \"Users\",\n" +
            "                    \"Posts\",\n" +
            "                    \"Search\"\n" +
            "                ],\n" +
            "                \"tableMapping\": {\n" +
            "                    \"Users\": [\n" +
            "                        \"username\",\n" +
            "                        \"Passwort\"\n" +
            "                    ],\n" +
            "                    \"Posts\": [\n" +
            "                        \"title\",\n" +
            "                        \"text\"\n" +
            "                    ],\n" +
            "                    \"Search\": [\n" +
            "                        \"Benutzer\"\n" +
            "                    ]\n" +
            "                }\n" +
            "            },\n" +
            "            \"demo-schema.xml\": {\n" +
            "                \"fileContent\": \"<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\\n<!--  <!DOCTYPE schema SYSTEM \\\"structure/pdgfSchema.dtd\\\">-->\\n\\n<!--\\n/*******************************************************************************\\n * Copyright (c) 2013, bankmark and/or its affiliates. All rights reserved.\\n * bankmark UG PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.\\n *\\n *\\n ******************************************************************************/\\n-->\\n<schema name=\\\"demo\\\"  xmlns:xsi=\\\"http://www.w3.org/2001/XMLSchema-instance\\\"\\nxsi:noNamespaceSchemaLocation=\\\"structure/pdgfSchema.xsd\\\">\\n\\n\\t<!-- All data is derived from this starting seed. \\n\\tIf this seed is the same, the generated data will the same on each computer/node/platform.\\n\\tChange this seed to generate a different data set.-->\\n\\t<seed>1234567890L</seed>\\n\\n\\t<rng name=\\\"PdgfDefaultRandom\\\"/>\\n\\n\\t<!--Default Scale factor for all tables -->\\n\\t<property name=\\\"SF\\\" type=\\\"double\\\">50</property>\\n\\t\\n\\t<!-- Constants -->\\n\\t<property name=\\\"EXCHANGE_RATE\\\" type=\\\"double\\\">1.25</property>\\n\\t<!-- ============================== -->\\n\\n\\t<table name=\\\"Customer\\\">\\n\\t\\t<!-- if tables should scale with -SF command line argument. Specify your scaling formula here: -->\\n\\t\\t<size>1000 * ${SF}</size>\\n\\n\\t\\t<field name=\\\"id\\\" size=\\\"10\\\" type=\\\"NUMERIC\\\">\\n\\t\\t\\t<gen_Id/>\\n\\t\\t</field>\\n\\t\\t<field name=\\\"lastname\\\" size=\\\"50\\\" type=\\\"VARCHAR\\\" >\\n\\t\\t\\t<gen_DictList>\\n\\t\\t\\t\\t<!--<disableRng>true</disableRng>--><!-- pick sequential instead of random: line=row mod lines -->\\n\\t\\t\\t\\t<file>dicts/Family-Names.dict</file>\\n\\t\\t\\t</gen_DictList>\\n\\t\\t</field>\\n\\t\\t<field name=\\\"firstname\\\" size=\\\"50\\\" type=\\\"VARCHAR\\\">\\n\\t\\t\\t<gen_Null probability=\\\"0.25\\\"><!-- 25% of values are NULL -->\\n\\t\\t\\t\\t<gen_DictList>\\n\\t\\t\\t\\t\\t<!--<disableRng>true</disableRng>-->\\n\\t\\t\\t\\t\\t<file>dicts/Given-Names.dict</file>\\n\\t\\t\\t\\t</gen_DictList>\\n\\t\\t\\t</gen_Null>\\n\\t\\t</field>\\n\\t</table>\\n\\n\\t<table name=\\\"Account\\\">\\n\\t\\t<size>1000 * ${SF}</size>\\n\\t\\t<field name=\\\"id\\\" size=\\\"4\\\" type=\\\"NUMERIC\\\">\\n\\t\\t\\t<gen_Id/>\\n\\t\\t</field>\\n\\t\\t<field name=\\\"customer_name\\\" size=\\\"30\\\" type=\\\"VARCHAR\\\">\\n\\t\\t\\t<gen_Sequential concatenateResults=\\\"true\\\" delimiter=\\\"-\\\" delimitEmptyValues=\\\"false\\\">\\n\\t\\t\\t\\t<gen_ReferenceValue id=\\\"customerSelector\\\" choose=\\\"permutationRandom\\\" from=\\\"historical\\\">\\n\\t\\t\\t\\t\\t<reference table=\\\"Customer\\\" field=\\\"firstname\\\" />\\n\\t\\t\\t\\t</gen_ReferenceValue>\\n\\t\\t\\t\\t<gen_ReferenceValue choose=\\\"sameChoiceAs\\\" from=\\\"\\\">\\n\\t\\t\\t\\t\\t<sameChoiceAs field=\\\"customer_name\\\" generatorByID=\\\"customerSelector\\\"/>\\n\\t\\t\\t\\t\\t<reference table=\\\"Customer\\\" field=\\\"lastname\\\" />\\n\\t\\t\\t\\t</gen_ReferenceValue>\\n\\t\\t\\t</gen_Sequential>\\n\\t\\t</field>\\n\\t\\t<field name=\\\"balance_EURO\\\" size=\\\"10\\\" type=\\\"NUMERIC\\\">\\n\\t\\t\\t<gen_DoubleNumber>\\n\\t\\t\\t\\t<minD>0.00</minD>\\n\\t\\t\\t\\t<maxD>10000.00</maxD>\\n\\t\\t\\t\\t<decimalPlaces roundingMode=\\\"HALF_EVEN\\\">2</decimalPlaces>\\n\\t\\t\\t\\t<format>%,10.2f</format><!-- ,= decimal grouping separator | 10=right align 10 | .2=two decimal places | f=floatingPoint-->\\n\\t\\t\\t\\t<locale>de</locale>\\n\\t\\t\\t</gen_DoubleNumber>\\n\\t\\t</field>\\n\\t\\t<field name=\\\"balance_EURO\\\" size=\\\"9\\\" type=\\\"NUMERIC\\\">\\n\\t\\t\\t<gen_DoubleNumber>\\n\\t\\t\\t\\t<minD>0.00</minD>\\n\\t\\t\\t\\t<maxD>10000.00</maxD>\\n\\t\\t\\t\\t<decimalPlaces roundingMode=\\\"HALF_EVEN\\\">2</decimalPlaces>\\n\\t\\t\\t\\t<format>###,###.##€</format><!-- ###,###=grouping separator between two groups of 3 digits | .##=two decimal places-->\\n\\t\\t\\t\\t<locale>de</locale>\\n\\t\\t\\t</gen_DoubleNumber>\\n\\t\\t</field>\\n\\t\\t<field name=\\\"balance_USD\\\" size=\\\"8\\\" type=\\\"NUMERIC\\\">\\n\\t\\t\\t<gen_Formula>\\n\\t\\t\\t\\t<gen_OtherFieldValue>\\n\\t\\t\\t\\t\\t<reference field=\\\"balance_EURO\\\" />\\n\\t\\t\\t\\t</gen_OtherFieldValue>\\n\\t\\t\\t\\t<formula>generator[0] * ${EXCHANGE_RATE}</formula>\\n\\t\\t\\t\\t<decimalPlaces roundingMode=\\\"HALF_UP\\\">2</decimalPlaces><!-- performs rounding of generated value -->\\n\\t\\t\\t</gen_Formula>\\n\\t\\t</field>\\n\\t\\t<field name=\\\"phone 1\\\" size=\\\"14\\\" type=\\\"VARCHAR\\\">\\n\\t\\t\\t<gen_FormatNumber splitIntoDigits=\\\"true\\\">\\n\\t\\t\\t\\t<gen_LongNumber>\\n\\t\\t\\t\\t\\t<min>10010001.0</min>\\n\\t\\t\\t\\t\\t<max>9999999999.0</max>\\n\\t\\t\\t\\t</gen_LongNumber>\\n\\t\\t\\t\\t<format>(%d%d%d) %d%d%d-%d%d%d%d</format>\\n\\t\\t\\t</gen_FormatNumber>\\n\\t\\t</field>\\n\\t\\t<field name=\\\"phone 2\\\" size=\\\"14\\\" type=\\\"VARCHAR\\\">\\n\\t\\t\\t<gen_MaskString>\\n\\t\\t\\t\\t<gen_LongNumber>\\n\\t\\t\\t\\t\\t<min>10010001.0</min>\\n\\t\\t\\t\\t\\t<max>9999999999.0</max>\\n\\t\\t\\t\\t</gen_LongNumber>\\n\\t\\t\\t\\t<mask>(###) ###-####</mask>\\n\\t\\t\\t</gen_MaskString>\\n\\t\\t</field>\\n\\t</table>\\n</schema>\\n\",\n" +
            "                \"existingTables\": [\n" +
            "                    \"Customer\",\n" +
            "                    \"Account\"\n" +
            "                ],\n" +
            "                \"tableMapping\": {\n" +
            "                    \"Customer\": [\n" +
            "                        \"id\",\n" +
            "                        \"lastname\",\n" +
            "                        \"firstname\"\n" +
            "                    ],\n" +
            "                    \"Account\": [\n" +
            "                        \"id\",\n" +
            "                        \"customer_name\",\n" +
            "                        \"balance_EURO\",\n" +
            "                        \"balance_EURO\",\n" +
            "                        \"balance_USD\",\n" +
            "                        \"phone 1\",\n" +
            "                        \"phone 2\"\n" +
            "                    ]\n" +
            "                }\n" +
            "            }\n" +
            "        },\n" +
            "        \"lastError\": \"\",\n" +
            "        \"allTables\": [\n" +
            "            \"Users\",\n" +
            "            \"Posts\",\n" +
            "            \"Search\",\n" +
            "            \"Customer\",\n" +
            "            \"Account\"\n" +
            "        ]\n" +
            "    }\n" +
            "}");
}

public static getTestConfigWithExistingData() {
        return JSON.parse("{\n" +
            "    \"repeat\": \"1\",\n" +
            "    \"scaleFactor\": \"1000\",\n" +
            "    \"activeInstancesPerSecond\": \"100\",\n" +
            "    \"maximumConcurrentRequests\": \"100\",\n" +
            "    \"stories\": [\n" +
            "        {\n" +
            "            \"atoms\": [\n" +
            "                {\n" +
            "                    \"id\": 0,\n" +
            "                    \"name\": \"Start\",\n" +
            "                    \"repeat\": 1,\n" +
            "                    \"successors\": [],\n" +
            "                    \"type\": \"START\",\n" +
            "                    \"x\": 10,\n" +
            "                    \"y\": 10\n" +
            "                },\n" +
            "                {\n" +
            "                    \"id\": 1,\n" +
            "                    \"name\": \"Data Generation\",\n" +
            "                    \"repeat\": 1,\n" +
            "                    \"successors\": [],\n" +
            "                    \"type\": \"DATA_GENERATION\",\n" +
            "                    \"x\": 326.18182373046875,\n" +
            "                    \"y\": 376.7727355957031,\n" +
            "                    \"data\": [\n" +
            "                        \"Benutzer\"\n" +
            "                    ],\n" +
            "                    \"dataToGenerate\": \"{\\\"value\\\":{\\\"Benutzer\\\":{\\\"__type\\\":\\\"EXISTING\\\",\\\"attributes\\\":{\\\"table\\\":\\\"Search\\\"},\\\"_keyhandler\\\":{}}}}\",\n" +
            "                    \"table\": \"_i6c3n3sh6\"\n" +
            "                },\n" +
            "                {\n" +
            "                    \"id\": 2,\n" +
            "                    \"name\": \"Data Generation\",\n" +
            "                    \"repeat\": 1,\n" +
            "                    \"successors\": [],\n" +
            "                    \"type\": \"DATA_GENERATION\",\n" +
            "                    \"x\": 171.18182373046875,\n" +
            "                    \"y\": 363.7727355957031,\n" +
            "                    \"data\": [\n" +
            "                        \"title\",\n" +
            "                        \"text\"\n" +
            "                    ],\n" +
            "                    \"dataToGenerate\": \"{\\\"value\\\":{\\\"title\\\":{\\\"__type\\\":\\\"EXISTING\\\",\\\"attributes\\\":{\\\"table\\\":\\\"Posts\\\"},\\\"_keyhandler\\\":{}},\\\"text\\\":{\\\"__type\\\":\\\"EXISTING\\\",\\\"attributes\\\":{\\\"table\\\":\\\"Posts\\\"},\\\"_keyhandler\\\":{}}}}\",\n" +
            "                    \"table\": \"_byi98tatw\"\n" +
            "                },\n" +
            "                {\n" +
            "                    \"id\": 3,\n" +
            "                    \"name\": \"Data Generation\",\n" +
            "                    \"repeat\": 1,\n" +
            "                    \"successors\": [],\n" +
            "                    \"type\": \"DATA_GENERATION\",\n" +
            "                    \"x\": 278.18182373046875,\n" +
            "                    \"y\": 246.77273559570312,\n" +
            "                    \"data\": [\n" +
            "                        \"username\",\n" +
            "                        \"Passwort\"\n" +
            "                    ],\n" +
            "                    \"dataToGenerate\": \"{\\\"value\\\":{\\\"username\\\":{\\\"__type\\\":\\\"EXISTING\\\",\\\"attributes\\\":{\\\"table\\\":\\\"Users\\\"},\\\"_keyhandler\\\":{}},\\\"Passwort\\\":{\\\"__type\\\":\\\"EXISTING\\\",\\\"attributes\\\":{\\\"table\\\":\\\"Users\\\"},\\\"_keyhandler\\\":{}}}}\",\n" +
            "                    \"table\": \"_rnw24ul5l\"\n" +
            "                }\n" +
            "            ],\n" +
            "            \"name\": \"Story #0\",\n" +
            "            \"scalePercentage\": 1\n" +
            "        }\n" +
            "    ],\n" +
            "    \"existingXMLs\": {\n" +
            "        \"uploadedFiles\": {\n" +
            "            \"customer.xml\": {\n" +
            "                \"existingTables\": [\n" +
            "                    \"Users\",\n" +
            "                    \"Posts\",\n" +
            "                    \"Search\"\n" +
            "                ],\n" +
            "                \"fileContent\": \"<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\\n<!--  <!DOCTYPE schema SYSTEM \\\"structure/pdgfSchema.dtd\\\">-->\\n\\n<!--\\n/*******************************************************************************\\n * Copyright (c) 2013, bankmark and/or its affiliates. All rights reserved.\\n * bankmark UG PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.\\n *\\n *\\n ******************************************************************************/\\n-->\\n<schema name=\\\"demo\\\"  xmlns:xsi=\\\"http://www.w3.org/2001/XMLSchema-instance\\\" xsi:noNamespaceSchemaLocation=\\\"structure/pdgfSchema.xsd\\\">\\n\\n\\t<!-- All data is derived from this starting seed.\\n\\tIf this seed is the same, the generated data will the same on each computer/node/platform.\\n\\tChange this seed to generate a different data set.-->\\n\\t<seed>1234567890</seed>\\n\\n\\t<rng name=\\\"PdgfDefaultRandom\\\"/>\\n\\n\\t<!--Default Scale factor for all tables -->\\n\\t<property name=\\\"SF\\\" type=\\\"double\\\">10000</property>\\n\\t<property name=\\\"Users\\\" type=\\\"double\\\">0.7 * ${SF}</property>\\n\\t<property name=\\\"Posts\\\" type=\\\"double\\\">0.7 * ${SF}</property>\\n\\t<property name=\\\"search\\\" type=\\\"double\\\">0.3 * ${SF}</property>\\n\\t<!-- ============================== -->\\n\\n\\t<table name=\\\"Users\\\">\\n\\t\\t<!-- if tables should scale with -SF command line argument. Specify your scaling formula here: -->\\n\\t\\t<size>${Users}</size>\\n\\t\\t<field name=\\\"username\\\" type=\\\"VARCHAR\\\" primary=\\\"true\\\" unique=\\\"true\\\">\\n\\t\\t\\t<gen_FormatString>\\n\\t\\t\\t\\t<format>%s.%s</format>\\n\\t\\t\\t\\t<gen_DictList id=\\\"FamilyNameGen\\\">\\n\\t\\t\\t\\t\\t<file>dicts/Family-Names.dict</file>\\n\\t\\t\\t\\t\\t<disableRng>true</disableRng>\\n\\t\\t\\t\\t</gen_DictList>\\n\\t\\t\\t\\t<gen_DictList id=\\\"FirstNameGen\\\">\\n\\t\\t\\t\\t\\t<file>dicts/Given-Names.dict</file>\\n\\t\\t\\t\\t\\t<disableRng>true</disableRng>\\n\\t\\t\\t\\t</gen_DictList>\\n        </gen_FormatString>\\n\\t\\t</field>\\n\\t\\t<field name=\\\"Passwort\\\" type=\\\"VARCHAR\\\">\\n\\t\\t\\t\\t<gen_RandomString>\\n\\t\\t\\t\\t<max>16</max>\\n\\t        </gen_RandomString>\\n\\t\\t</field>\\n\\t</table>\\n\\n\\t<table name=\\\"Posts\\\">\\n\\t\\t<size>${Posts}</size>\\n\\t\\t<field name=\\\"title\\\" type=\\\"VARCHAR\\\">\\n\\t\\t\\t<!-- Generiert mit  java7 -cp pdgf.jar pdgf.util.text.MarkovChainBuilder -n 4 LICENSE.txt dicts/markovExample/Food.bin 2538.-->\\n\\t\\t\\t<gen_MarkovChainText>\\n\\t\\t\\t\\t\\t\\t<min>2</min><max>50</max>\\n\\t\\t\\t\\t\\t\\t<file>dicts/markovExample/Books_Literature_Fiction.bin</file>\\n\\t\\t\\t</gen_MarkovChainText>\\n\\t\\t</field>\\n\\t\\t<field name=\\\"text\\\" type=\\\"VARCHAR\\\">\\n\\t\\t\\t<!-- Generiert mit  java7 -cp pdgf.jar pdgf.util.text.MarkovChainBuilder -n 4 LICENSE.txt dicts/markovExample/Food.bin 2538.-->\\n\\t\\t\\t<gen_MarkovChainText>\\n\\t\\t\\t\\t\\t\\t<min>10</min><max>2000</max>\\n\\t\\t\\t\\t\\t\\t<file>dicts/markovExample/Electronics_Camera_Photo.bin</file>\\n\\t\\t\\t</gen_MarkovChainText>\\n\\t\\t</field>\\n\\t</table>\\n\\n\\t<table name=\\\"Search\\\">\\n\\t\\t<size>${search}</size>\\n\\t\\t<field name=\\\"Benutzer\\\" type=\\\"VARCHAR\\\">\\n\\t\\t\\t<gen_ReferenceValue choose=\\\"random\\\" from=\\\"historical\\\" id='SearchGenerator1'>\\n\\t\\t\\t\\t<reference field=\\\"text\\\" table=\\\"Posts\\\"/>\\n\\t\\t\\t</gen_ReferenceValue>\\n\\t\\t</field>\\n\\t</table>\\n\\n</schema>\\n\",\n" +
            "                \"tableMapping\": {\n" +
            "                    \"Users\": [\n" +
            "                        \"username\",\n" +
            "                        \"Passwort\"\n" +
            "                    ],\n" +
            "                    \"Posts\": [\n" +
            "                        \"title\",\n" +
            "                        \"text\"\n" +
            "                    ],\n" +
            "                    \"Search\": [\n" +
            "                        \"Benutzer\"\n" +
            "                    ]\n" +
            "                }\n" +
            "            }\n" +
            "        },\n" +
            "        \"lastError\": \"\",\n" +
            "        \"allTables\": [\n" +
            "            \"Users\",\n" +
            "            \"Posts\",\n" +
            "            \"Search\"\n" +
            "        ]\n" +
            "    }\n" +
            "}");
}

}

it("returns no empty string", () => {

    expect(XMLFixtures.getCustomerXML()).not.toEqual("");
});
