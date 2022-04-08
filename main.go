package main

import (
	_ "default-theme-beego/app/route"
	"github.com/astaxie/beego"
)

func main() {
	// 设置资源目录
	beego.SetStaticPath("assets","public/assets")
	beego.Run()
}