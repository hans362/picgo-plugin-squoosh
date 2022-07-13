const { ImagePool, encoders } = require('@squoosh/lib')

const DefaultEncodeOptions = Object.fromEntries(
  Object.entries(encoders).map(([key, encoder]) => {
    const extension = `.${encoder.extension}`
    return [extension, Object.fromEntries([[key, {}]])]
  })
)

const supportedExtensions = { '.jpg': true, '.jpeg': true, '.png': true, '.webp': true }

const handle = async (ctx) => {
  ctx.log.info('**** Squoosh begins here ****')
  let t0 = new Date()
  let imagePool = new ImagePool()
  const jobs = ctx.output.map(async outputi => {
    try {
      if (supportedExtensions[outputi.extname.toLowerCase()]) {
        let t = new Date()
        let b = outputi.buffer
        let ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
        let image = imagePool.ingestImage(ab)
        let originSize = Math.round(b.byteLength / 1024)
        ctx.log.info(`Compressing ${outputi.fileName} ${originSize} kb`)
        await image.encode(DefaultEncodeOptions[outputi.extname])
        let encoded = await Object.values(image.encodedWith)[0]
        outputi.buffer = Buffer.from(encoded.binary)
        let newSize = Math.round(encoded.size / 1024)
        let ratio = Math.round(newSize / originSize * 100)
        ctx.log.success(`Finishes ${outputi.fileName} ${newSize} kb ${ratio}% ${new Date().getTime() - t.getTime()} ms`)
      }
      return outputi
    } catch (err) {
      ctx.emit('notification', {
        title: `${outputi.fileName} compression error`,
        body: err
      })
      ctx.log.error(`${outputi.fileName} compression error`)
      ctx.log.error(err)
    }
  })
  ctx.output = await Promise.all(jobs)
  ctx.output = ctx.output.filter(Boolean)
  imagePool.close()
  ctx.log.info(`**** Squoosh ends here ${new Date().getTime() - t0.getTime()} ms ****`)
  return ctx
}

module.exports = (ctx) => {
  const register = () => {
    ctx.helper.beforeUploadPlugins.register('squoosh', {
      handle
    })
  }
  return {
    register
  }
}
