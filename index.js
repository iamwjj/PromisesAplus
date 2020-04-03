class Promise {
  constructor(fn) {
    this._state = 'pending'
    this.value = null
    this.reason = null
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []
    // 当fn不是函数时
    if(typeof fn !== 'function') {
      throw new TypeError(`Promise resolver ${fn} is not a function`)
    }
    try{
      fn(this.resolve.bind(this), this.reject.bind(this))
    }catch (e){
      this.reject(e)
    }
  }

  resolve(data) {
    if(this._state === 'pending') {
      this._state = 'fulfilled'
      this.value = data
      this.onFulfilledCallbacks.forEach(cb => cb(data))
    }
  }

  reject(error) {
    if(this._state === 'pending') {
      this._state = 'rejected'
      this.reason = error
      this.onRejectedCallbacks.forEach(cb => cb(error))
    }
  }

  then(onResolved, onRejected) {
    if(typeof onResolved !== 'function') {
      onResolved = function(value) {
        return value
      }
    }

    if(typeof onRejected !== 'function') {
      onRejected = function(error) {
        throw error
      }
    }
    
    let p = new Promise((resolve, reject) => {
      if(this._state === 'fulfilled') {
        setTimeout(async () => {
          try{
            let val = onResolved(this.value)
            if(val === p) {
              throw new TypeError('Chaining cycle deleted for promise')
            }
            resolve(await val)
          }catch (e) {
            reject(e)
          }
        }, 0)
      }

      if(this._state === 'rejected') {
        setTimeout(async () => {
          try{
            let res = onRejected(this.reason)
            if(res === p) {
              throw new TypeError('Chaining cycle deleted for promise')
            }
            resolve(await res)
          }catch (e) {
            reject(e)
          }
        }, 0)
      }
      if(this._state === 'pending') {
        typeof onResolved == 'function' && this.onFulfilledCallbacks.push((value) => {
          setTimeout(async () => {
            try{
              let val = onResolved(this.value)
              if(val === p) {
                throw new TypeError('Chaining cycle deleted for promise')
              }
              resolve(await val)
            }catch (e) {
              reject(e)
            }
          })
        })
        typeof onRejected == 'function' && this.onRejectedCallbacks.push((value) => {
          setTimeout(async () => {
            try{
              let res = onRejected(this.reason)
              if(res === p) {
                throw new TypeError('Chaining cycle deleted for promise')
              }
              resolve(await res)
            }catch (e) {
              reject(e)
            }
          })
        })
      }
    })

    return p
  }

  catch(onRejected) {
    this.then(null, onRejected)
  }
}
