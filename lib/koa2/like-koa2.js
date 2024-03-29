const http = require('http')

// 组合中间件
function compose(middlewareList) {
    return function(ctx) {
        function dispatch(i) {
            const fn = middlewareList[i]
            try {
                return Promise.resolve(
                    fn(ctx, dispatch.bind(null, i + 1))
                )
            } catch (err) {
                Promise.reject(err)
            }
        }
        dispatch(0)
    }
}

class LikeKoa2 {
    constructor() {
        this.middlewareList = []
    }

    use(fn) {
        this.middlewareList.push(fn)
        return this
    }

    createCtx(req, res) {
        const ctx = {
            req,
            res
        }
        return ctx
    }

    handleRequest(ctx, fn) {
        return fn(ctx)
    }

    callback() {
        const fn = compose(this.middlewareList)        
        return (req, res) => {
            const ctx = this.createCtx(req, res)            
            return this.handleRequest(ctx, fn)
        }
    }

    listen(...args) {
        const server = http.createServer(this.callback())
        server.listen(...args)
    }
}

module.exports = LikeKoa2