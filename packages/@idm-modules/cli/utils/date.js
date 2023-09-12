const timeFormat = () => {
    var time = new Date()
    var year = time.getFullYear()
    var month = time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1;
    var day = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
    var hour = time.getHours() < 10 ? '0' + time.getHours() : time.getHours()
    var minute = time.getMinutes() <10 ? '0'+ time.getMinutes() : time.getMinutes()
    var second = time.getSeconds() <10 ? '0'+ time.getSeconds() : time.getSeconds()
    let currentTime = `${year}-${month}-${day} ${hour}.${minute}.${second}`
    return currentTime
}

module.exports = {
    timeFormat
}