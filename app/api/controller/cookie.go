package controller

import (
	"github.com/astaxie/beego"
)

type CookieController struct {
	beego.Controller
}

// Delete cookie
func (ctx *CookieController) Delete() {
	ctx.Ctx.SetCookie("LOGIN-TOKEN", "", -1, "/")
	ctx.Data["json"] = map[string]any{"code": 200, "msg": "success", "data": nil}
	ctx.ServeJSON()
}