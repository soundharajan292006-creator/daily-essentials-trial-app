const fs = require("fs");
const path = require("path");
const https = require("https");

const products = [
    {
        id: 63,
        name: "Tata Salt Iodised Salt",
        file: "tata-salt.jpg",
        page: "https://www.tataconsumer.com/brands/foods/tata-salt"
    },
    {
        id: 64,
        name: "Aashirvaad Whole Wheat Atta",
        file: "aashirvaad-atta.jpg",
        page: "https://aashirvaad.com/our-products/atta/shudh-chakki-atta.html"
    },
    {
        id: 65,
        name: "MAGGI 2-Minute Masala Noodles",
        file: "maggi-masala-noodles.jpg",
        page: "https://www.maggi.in/en/product/maggi-2-minute-noodles/"
    },
    {
        id: 70,
        name: "Tata Tea Premium",
        file: "tata-tea-premium.jpg",
        page: "https://www.tataconsumer.com/brands/tea/tata-tea"
    },
    {
        id: 71,
        name: "Brooke Bond Red Label Natural Care",
        file: "red-label-natural-care.jpg",
        page: "https://hul-performance-highlights.hul.co.in/performance-highlights-fy-2022-2023/food-and-refreshments.html"
    },
    {
        id: 72,
        name: "Amul Taaza Homogenised Toned Milk",
        file: "amul-taaza.jpg",
        page: "https://old.amul.com/products/amul-uhttaaza-info.php"
    },
    {
        id: 73,
        name: "Kelloggs Corn Flakes Original",
        file: "kelloggs-corn-flakes.jpg",
        page: "https://www.kelloggs.com/en-in/products/corn-flakes/corn-flakes-original-and-the-best-cereal.html"
    },
    {
        id: 74,
        name: "MTR Poha",
        file: "mtr-poha.jpg",
        page: "https://www.mtrfoods.com/products/breakfast-mixes"
    }
];

function request(url, redirects = 0) {
    return new Promise((resolve, reject) => {
        if (redirects > 8) return reject(new Error("Too many redirects"));

        https.get(
            url,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "text/html,image/webp,image/png,image/jpeg,*/*"
                }
            },
            res => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    const next = new URL(res.headers.location, url).href;
                    res.resume();
                    return resolve(request(next, redirects + 1));
                }

                const chunks = [];
                res.on("data", c => chunks.push(c));
                res.on("end", () => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        buffer: Buffer.concat(chunks),
                        finalUrl: url
                    });
                });
            }
        ).on("error", reject);
    });
}

function clean(url, base) {
    if (!url) return null;

    try {
        if (url.startsWith("//")) url = "https:" + url;
        return new URL(url.replace(/&amp;/g, "&"), base).href;
    } catch {
        return null;
    }
}

function badImage(url) {
    const x = String(url || "").toLowerCase();

    return [
        "logo",
        "favicon",
        "sprite",
        "placeholder",
        "noimage",
        "no-image",
        "banner",
        "icon",
        "default"
    ].some(v => x.includes(v));
}

function getMeta(html, name) {
    const patterns = [
        new RegExp(
            `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`,
            "i"
        ),
        new RegExp(
            `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`,
            "i"
        )
    ];

    for (const regex of patterns) {
        const match = html.match(regex);
        if (match) return match[1];
    }

    return null;
}

function findMatchingImg(html, productName, base) {
    const wanted = productName
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(x => x.length > 2);

    const regex = /<img[^>]+>/gi;
    const tags = html.match(regex) || [];

    let best = null;

    for (const tag of tags) {
        const srcMatch =
            tag.match(/(?:src|data-src)=["']([^"']+)["']/i);

        const altMatch =
            tag.match(/alt=["']([^"']*)["']/i);

        if (!srcMatch) continue;

        const src = clean(srcMatch[1], base);
        const alt = (altMatch?.[1] || "").toLowerCase();

        if (!src || badImage(src)) continue;

        let score = 0;

        for (const word of wanted) {
            if (alt.includes(word)) score++;
            if (src.toLowerCase().includes(word)) score++;
        }

        if (!best || score > best.score) {
            best = { src, score, alt };
        }
    }

    return best && best.score >= 2 ? best.src : null;
}

function extractImage(html, product, base) {
    const imgFromTag =
        findMatchingImg(html, product.name, base);

    if (imgFromTag) return imgFromTag;

    const metaCandidates = [
        getMeta(html, "og:image"),
        getMeta(html, "og:image:secure_url"),
        getMeta(html, "twitter:image")
    ];

    for (const candidate of metaCandidates) {
        const url = clean(candidate, base);

        if (url && !badImage(url)) {
            return url;
        }
    }

    return null;
}

async function downloadImage(url, file) {
    const res = await request(url);

    if (res.status !== 200)
        throw new Error(`Image HTTP ${res.status}`);

    const type =
        String(res.headers["content-type"] || "").toLowerCase();

    if (!type.startsWith("image/"))
        throw new Error("URL is not an image");

    if (res.buffer.length < 7000)
        throw new Error("Image too small");

    const dest = path.join(__dirname, file);
    const temp = dest + ".download";

    fs.writeFileSync(temp, res.buffer);
    fs.renameSync(temp, dest);

    return Math.round(res.buffer.length / 1024);
}

async function run(product) {
    console.log(`\n===== ${product.id}. ${product.name} =====`);

    try {
        const page = await request(product.page);

        if (page.status !== 200) {
            console.log(`SKIP ❌ Page HTTP ${page.status}`);
            return false;
        }

        const html = page.buffer.toString("utf8");

        const image =
            extractImage(html, product, page.finalUrl);

        if (!image) {
            console.log("SKIP ⚠️ Exact image not safely found");
            return false;
        }

        console.log("IMAGE:", image);

        const kb =
            await downloadImage(image, product.file);

        console.log(`SUCCESS ✅ ${kb} KB`);

        return true;
    } catch (e) {
        console.log("SKIP ❌", e.message);
        return false;
    }
}

async function main() {
    console.log("\nFIXING ONLY 8 WRONG FOOD IMAGES\n");

    let success = 0;

    for (const product of products) {
        if (await run(product)) success++;

        await new Promise(r =>
            setTimeout(r, 700)
        );
    }

    console.log("\n============================");
    console.log(`UPDATED : ${success}`);
    console.log(`SKIPPED : ${products.length - success}`);
    console.log("============================");
}

main();