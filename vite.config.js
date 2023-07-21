import { defineConfig } from "vite"
import vitePugPlugin from "vite-plugin-pug-transformer"
import sharp from "sharp"
import path from "node:path"
import fs from "node:fs"

const getWebpParams = (src, typeImage) => {
    const file = fs.readFileSync(path.resolve("./", src)),
        ext = path.extname(path.resolve("./", src)),
        pathname = path.dirname(path.resolve("./", src)),
        name = path.basename(path.resolve("./", src)).replace(ext, ""),
        newFormat = (w = "") => path.resolve(pathname, name + "@" + w + "." + typeImage)

    return { file, ext, pathname, name, newFormat }
}
function createWebpByArrMedia(src, arrMedia, typeImage) {
    const { file, newFormat } = getWebpParams(src, typeImage)
    for (const media of arrMedia) {
        sharp(file)
            .resize(media)
            .toFile(newFormat(media), err => console.warn(err))
    }
}

// function createWebpSrcset(src, arrMedia) {
//     let res = ""
//     const { file, webp } = getWebpParams(src)
//     for (const media of arrMedia.sort((a, b) => a - b)) {
//         res += `/${src.replace(/\.(jpg|jpeg|png)/, `@${media}.webp`)} ${media}w, `
//     }
//     return res.trim().replace(/\,$/, "")
// }

function createWebpSources(src, arrMedia, typeImage) {
    const arr = []
    // const { file, webp } = getWebpParams(src, typeImage)
    for (const media of arrMedia.sort((a, b) => a - b)) {
        arr.push(`
            <source srcset="/${src.replace(
                /\.(jpg|jpeg|png)/,
                `@${media}.${typeImage}`,
            )} " media="(max-width:${media}px)" />
        `)
    }
    return arr
}

function myPlugin(arrMedia) {
    return {
        name: "transform-file",
        enforce: "post",
        transformIndexHtml: {
            transform(src) {
                return src.replace(/(<img.+>)/g, (_, p) => {
                    const src = p.match(/(?<=src=\")(.+?)(?=\")/)[0].replace(/^\//, "")

                    if (src.startsWith("http") || src.startsWith("http")) return p

                    // const { file, webp } = getWebpParams(src, typeImage)

                    // sharp(file).toFile(webp(), err => console.warn(err))
                    createWebpByArrMedia(src, arrMedia, "avif")
                    createWebpByArrMedia(src, arrMedia, "webp")

                    return `
                        <picture>
                            ${createWebpSources(src, arrMedia, "avif").join("\n")}
                            ${createWebpSources(src, arrMedia, "webp").join("\n")}
                            <img srcset="/${src}"/>
                        </picture>
                    `
                })
            },
        },
    }
}

export default defineConfig({
    plugins: [vitePugPlugin(), myPlugin([1024, 768, 425, 375, 320])],
})
