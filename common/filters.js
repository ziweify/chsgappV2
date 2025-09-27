
const removeSpace = (str) => {
	return str.trim().replace(/\n/g, "").replace(/\n/g, "").replace(/\n/g, "").replace(/\s/g, "");
}

const numberFormat = number => {
	number = Number(number)
	if(number > 1000000){
		return Number((number / 1000000).toFixed(1)) + 'M'
	}else if(number > 1000){
		return Number((number / 1000).toFixed(1)) + 'K'
	}else{
		return Number(number.toFixed(4))
	}
}

const retImageUrl = src => {
	// const baseUrl = 'https://www.youxinb.com'
	const baseUrl = ''
	//如果带http，则直接返回
	if(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?/.test(src)){
		return src
	}else if(src){
		return baseUrl + src
	}else return ''
}

//根据精度设置数字
const setPrecision = (number,length = 2) =>{
	number = Number(number)
	if(length === 0) return String(parseInt(number))
	return number.toFixed(length)
}

export {
	removeSpace,
	numberFormat,
	retImageUrl,
	setPrecision
}