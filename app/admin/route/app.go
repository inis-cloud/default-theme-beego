package route

import (
	"default-theme-beego/app/admin/controller/views"
	"default-theme-beego/vender/utils"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/context"
)

func init() {
	// 后台路由
	admin := beego.NewNamespace("/admin",
		beego.NSRouter("/config.html",&views.ConfigController{}),
		beego.NSRouter("/config.htm",&views.ConfigController{}),
		beego.NSRouter("/config",&views.ConfigController{}),
		beego.NSRouter("/personal.html",&views.PersonalController{}),
		beego.NSRouter("/personal.htm",&views.PersonalController{}),
		beego.NSRouter("/personal",&views.PersonalController{}),
		beego.NSRouter("",&views.IndexController{}),
	)
	// 添加路由分组
	beego.AddNamespace(admin)
	// 过滤器
	beego.InsertFilter("/admin/*", beego.BeforeExec, func(ctx *context.Context) {
		loginToken := ctx.GetCookie("LOGIN-TOKEN")
		// 如果没有登录
		if _, empty := utils.TypeOf(loginToken); empty {
			ctx.Redirect(302, "/")
			return
		}
	})
}