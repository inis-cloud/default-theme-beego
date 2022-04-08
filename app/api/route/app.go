package route

import (
	"default-theme-beego/app/api/controller"
	"github.com/astaxie/beego"
)

func init() {
	beego.Router("/api/cookie", &controller.CookieController{}, "get:Get;delete:Delete")
}