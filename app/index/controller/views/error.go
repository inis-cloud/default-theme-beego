package views

type ErrorController struct {
	BaseController
}

type ErrorItem struct {
	Code 	int
	Title 	string
	Content string
	HTML 	string
	Cover   bool
}

func (ctx *ErrorController) Error401() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	ctx.Data["error"]   = ErrorItem{
		Code: 401,
		Title: "401",
		Content: "未经授权，请求要求验证身份",
	}
	ctx.TplName="layout/error.html"
}
func (ctx *ErrorController) Error403() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	ctx.Data["error"]   = ErrorItem{
		Code: 403,
		Title: "403",
		Content: "服务器拒绝请求",
	}
	ctx.TplName="layout/error.html"
}
func (ctx *ErrorController) Error404() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	ctx.Data["error"]   = ErrorItem{
		Code: 404,
		Title: "404",
		Content: "很抱歉您访问的地址或者方法不存在",
	}
	ctx.TplName="layout/error.html"
}

func (ctx *ErrorController) Error500() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	ctx.Data["error"]   = ErrorItem{
		Code: 500,
		Title: "500",
		Content: "服务器内部错误",
	}
	ctx.TplName = "layout/error.html"
}
func (ctx *ErrorController) Error503() {
	base := new(BaseController)
	ctx.Data["config"] 	= base.themeConfig()
	ctx.Data["inis"]	= base.inisConfig()
	ctx.Data["error"]   = ErrorItem{
		Code: 503,
		Title: "503",
		Content: "服务器目前无法使用（由于超载或停机维护）",
	}
	ctx.TplName = "layout/error.html"
}