// ==UserScript==
// @name         Stable Diffusion image metadata viewer
// @namespace    https://github.com/himuro-majika
// @version      0.2.1
// @description  Show Stable Diffusion generated image's metadata
// @author       himuro_majika
// @match        http://*/*.png
// @match        http://*/*.jpg
// @match        http://*/*.jpeg
// @match        http://*/*.webp
// @match        https://*/*.png
// @match        https://*/*.jpg
// @match        https://*/*.jpeg
// @match        https://*/*.webp
// @match        file:///*.png
// @match        file:///*.jpg
// @match        file:///*.jpeg
// @match        file:///*.webp
// @require      https://cdn.jsdelivr.net/npm/exifreader@4.11.0/dist/exif-reader.min.js
// @license      MIT
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const img = document.images[0];
    if (img) readExif(img);

    async function readExif(img) {
        const fileBuffer = await fetch(img.src).then(response => response.arrayBuffer()).catch(() => {return;});
        if (!fileBuffer) return;
        const tags = ExifReader.load(fileBuffer);
        // console.dir(tags);
        const com = getComment(tags);
        if (!com) return;
        makeButton();
        makeData(com);
    }

    function getComment(tags) {
        delete tags["MakerNote"];
        delete tags["Bit Depth"];
        delete tags["Color Type"];
        delete tags["Compression"];
        delete tags["Filter"];
        delete tags["Image Height"];
        delete tags["Image Width"];
        delete tags["Interlace"];

        let com = ""

        // Exif
        if (tags["Exif IFD Pointer"] &&
            tags["UserComment"] &&
            tags["UserComment"].description == "[Unicode encoded text]") {
            com = decodeUnicode(tags["UserComment"].value);
            return com;
        }

        // iTXt
        if (tags["Description"]) {
            com += tags["Description"].description;
            delete tags["Description"];
        }
        if (tags["Comment"]) {
            com += tags["Comment"].description.replaceAll(/\\u00a0/g, " ");
            delete tags["Comment"];
        }
        if (tags["Title"]) {
            com += tags["Title"].description;
            delete tags["Title"];
        }
        if (tags["Source"]) {
            com += tags["Source"].description;
            delete tags["Source"];
        }
        if (tags["Software"]) {
            com += tags["Software"].description;
            delete tags["Software"];
        }

        Object.keys(tags).forEach(tag => {
            com += tags[tag].description;
        });

        console.log(com);
        return com;
    }

    function decodeUnicode(array) {
        const plain = array.map(t => t.toString(16).padStart(2, "0")).join("");
        if (!plain.match(/^554e49434f44450/)) {
            // console.log(array);
            return;
        }
        const hex = plain.replace(/^554e49434f44450[0-9]/, "").replace(/[0-9a-f]{4}/g, ",0x$&").replace(/^,/, "");
        const arhex = hex.split(",");
        let decode = "";
        arhex.forEach(v => {
            decode += String.fromCodePoint(v);
        })
        return decode;
    }

    function makeButton() {
        const button = document.createElement("button");
        button.innerHTML = "Show SD metadata";
        button.addEventListener("click", showModal);
        document.body.insertBefore(button, img);
    }

    function makeData(text) {
        const positive = extractPositivePrompt(text);
        const negative = extractNegativePrompt(text);
        const others = extractOthers(text);
        const container = document.createElement("div");
        container.id ="_gm_sipv_container";
        container.style.display = "none";
        container.style.width = "100%";
        const copybutton = location.protocol == "http:" ? "" : `<button class="_gm_sipv_copybutton" type="button" style="cursor: pointer; opacity: 0.5;">copy</button>`;
        container.innerHTML = `
<div style="color: #eee; width: 800px; max-width: 100%; margin-left: auto; margin-right: auto; z-index: 2; position: fixed; inset: auto 0; margin: auto; background: #000a; border-radius: 6px; box-shadow: #000 0px 0px 2px;">
    <div style="display:flex; justify-content: space-between; padding: 0px 10px;">
        <h5>Stable Diffusion image metadata</h5>
        <button id="_gm_sipv_closebutton" type="button" style="cursor: pointer; height: 4em; opacity: 0.5; padding: 1em; background: #0000; border: 0; width: 3em;">❎</button>
    </div>
    <div style="padding: 10px;">
        <div>
            <div style="display:flex; justify-content: space-between;">
                <label>Prompt</label>
                ${copybutton}
            </div>
            <textarea rows="6" style="display: block; width: 774px; max-width: 100%; background: #cccc; border: 0px none; margin: 10px 0;">${positive}</textarea>
        </div>
        <div>
            <div style="display:flex; justify-content: space-between;">
                <label>Negative Prompt</label>
                ${copybutton}
            </div>
            <textarea rows="6" style="display: block; width: 774px; max-width: 100%; background: #cccc; border: 0px none; margin: 10px 0;">${negative}</textarea>
        </div>
        <div>
            <div style="display:flex; justify-content: space-between;">
                <label>Other info</label>
                ${copybutton}
            </div>
            <textarea rows="3" style="display: block; width: 774px;  max-width: 100%;background: #cccc; border: 0px none; margin: 10px 0;">${others}</textarea>
        </div>
    </div>
</div>`;
        document.body.insertBefore(container, img);
        document.getElementById("_gm_sipv_closebutton").addEventListener("click", closeModal);
        document.querySelectorAll("._gm_sipv_copybutton").forEach(item => {
            item.addEventListener("click", copyText);
        });
    }

    function extractPositivePrompt(text) {
        try {
            let matchtext = 
            text.match(/([^]+)Negative prompt: /) || 
            text.match(/([^]+)Steps: /) || 
            text.match(/([^]+){"steps"/) || 
            text.match(/([^]+)\[[^[]+\]/);
            return matchtext[1];
        } catch (e) {
            console.log(text);
            return "";
        }
    }

    function extractNegativePrompt(text) {
        try {
            let matchtext = 
            text.match(/Negative prompt: ([^]+)Steps: /) || 
            text.match(/"uc": "([^]+)"}/) || 
            text.match(/\[([^[]+)\]/);
            return matchtext[1];
        } catch (e) {
            console.log(text);
            return "";
        }
    }

    function extractOthers(text) {
        try {
            let matchtext = 
            text.match(/(Steps: [^]+)/) || 
            text.match(/{("steps"[^]+)"uc": /) || 
            text.match(/\]([^]+)/);
            return matchtext[1];
        } catch (e) {
            console.log(text);
            return text;
        }
    }

    function showModal() {
        document.getElementById("_gm_sipv_container").style.display = "block";
    }

    function closeModal() {
        document.getElementById("_gm_sipv_container").style.display = "none";
    }

    function copyText() {
        const value = this.parentNode.parentNode.querySelector("textarea").value;
        navigator.clipboard.writeText(value);
    }

})();