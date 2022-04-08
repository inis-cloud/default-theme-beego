package views

import (
	"default-theme-beego/app/index/controller"
	"default-theme-beego/vender/utils"
	"fmt"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/config"
	"io/ioutil"
	"os"
)

type BaseController struct {
	beego.Controller
}

func init() {
	beego.AddFuncMap("empty", empty)
	beego.AddFuncMap("not_empty", notEmpty)
}

// empty => 是否为空
func empty(in interface{}) (out interface{}) {
	if _, empty := utils.TypeOf(in); empty {
		out = true
	} else {
		out = false
	}
	return
}

// notEmpty => 不为空
func notEmpty(in interface{}) (out interface{}) {
	if _, empty := utils.TypeOf(in); !empty {
		out = true
	} else {
		out = false
	}
	return
}

// 获取站点信息
func (ctx *BaseController) themeConfig() interface{} {
	site := controller.Get("options", map[string]string{
		"key":"config:default-theme-beego",
	})
	// 从配置文件中获取默认主题配置
	if site.Code != 200 {
		file, err := os.Open("public/assets/json/config.json")
		if err != nil {
			fmt.Println(err)
		} else {
			byteValue, _ := ioutil.ReadAll(file)
			data := map[string]interface{}{
				"key":"config:default-theme-beego",
				"value": nil,
				"opt": utils.Json(string(byteValue)),
			}
			site.Data = data
		}
		defer file.Close()
	}
	return site
}

// 返回配置给前端
func (ctx *BaseController) inisConfig() interface{} {

	inis, _ := config.NewConfig("ini", "conf/inis.ini")

	return map[string]string{
		"api"	 : utils.CustomProcessApi(inis.String("api"),""),
		"token"  : inis.String("token"),
		"version": inis.String("version"),
	}
}

























//type Create struct {
//	Code int
//	Msg  string
//	Data interface{}
//}

func (ctx *BaseController) SuccessJson(data interface{}) {

	//result := Create{
	//	200, "success", data,
	//}
	//ctx.Data["json"] = result
	ctx.Data["title"]= "这是后端给的标题"
	//// 对json进行序列化输出
	//ctx.ServeJSON()
	//ctx.StopRun()
}
