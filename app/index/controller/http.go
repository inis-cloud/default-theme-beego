package controller

import (
	"default-theme-beego/vender/utils"
	"github.com/astaxie/beego/config"
)

// 获取并处理API
func api() string {
	inis, _ := config.NewConfig("ini", "conf/inis.ini")
	api 	:= utils.CustomProcessApi(inis.String("api"),"")
	return api
}

// 获取token
func token() string {
	inis, _ := config.NewConfig("ini", "conf/inis.ini")
	return inis.String("token")
}

type ApiJson struct{
	Code int
	Msg  string
	Data any
}

// Get
// 发起一个Get请求
// url: api地址
// params[0] 请求参数
// params[1] 请求头信息
func Get(url string, params ...map[string]string) (result ApiJson) {

	result.Code = 500
	result.Msg  = "服务器错误"
	result.Data = nil

	if len(params) == 0 {
		res, _ := utils.Get(api() + url, map[string]string{}, map[string]string{
			"token":token(),
		})
		result.Code = res.Code
		result.Msg  = res.Msg
		result.Data = res.Data
	} else if len(params) == 1 {
		res, _ := utils.Get(api() + url, params[0], map[string]string{
			"token":token(),
		})
		result.Code = res.Code
		result.Msg  = res.Msg
		result.Data = res.Data
	} else if len(params) == 2 {
		res , _ := utils.Get(api() + url, params[0], utils.MapMergeString(map[string]string{
			"token":token(),
		},params[1]))
		result.Code = res.Code
		result.Msg  = res.Msg
		result.Data = res.Data
	}

	return
}