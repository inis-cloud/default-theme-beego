package main

import (
	"default-theme-beego/app/index/controller/views"
	_ "default-theme-beego/app/route"
	"github.com/astaxie/beego"
)

func main() {
	// 设置资源目录
	beego.SetStaticPath("assets","public/assets")
	beego.ErrorController(&views.ErrorController{})
	beego.Run()
}