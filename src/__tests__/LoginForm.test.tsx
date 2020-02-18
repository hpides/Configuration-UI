import React from "react";
import { BaseModel, DeserializeEvent, CanvasEngine } from '@projectstorm/react-canvas-core';
import {DelayNode} from "../GraphView/Nodes/DelayNode"
import { expect } from 'chai';
describe("DelayNode", () => {
    test("should be able to be constructed", async () => {
        const node = new DelayNode()
        node.setAttribute("delay", "10");
        const json = node.doSerialization();
        const otherNode = new DelayNode();
        otherNode.doDeserialization(json);
        expect(otherNode.getAttribute("delay")).to.eq("10")
    });
});