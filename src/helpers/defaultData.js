import { nanoid } from "nanoid"

/**
 * Build a default dataset
 * @returns {array}
 */
const generateDefaultData = () => {
    const defaultData = []

    const titles = ["Apples", "Tomatoes", "Grapes"]
    const descriptions = ["Large", "Medium", "Small"]

    const rndm = (items) => items[Math.floor(Math.random()*items.length)]

    // generate seed data
    for (let i = 0; i < 20; i++) {
        const name = rndm(titles)
        const description = `${rndm(descriptions)} ${name}`
        const id = nanoid()
        const count = Math.floor(Math.random() * 10) || 1

        const row = {
            _type: "item",
            _id: id,
            name: name,
            description: description,
            count: count
        }

        // seed a reference for additional information on some items
        // mainly so we can interact with more advanced GROQ queries
        if (count > 5) {
            const mId = nanoid()
            const more = {
                _type: "more",
                _id: mId,
                foo: "bar",
            }
            defaultData.push(more)

            row.more = {
                _type: "reference",
                _ref: mId,
            }
        }

        defaultData.push(row)
    }
    return defaultData
}

export default generateDefaultData