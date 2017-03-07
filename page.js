define(function (require, exports, module) {
    //分页类
    ;(function(window){

        //初始化，构造函数
        var Page = function()
        {

            // 定义默认配置项
            var defaults =
            {
                data:[],                            //所有分页列表数据 支持所有数据为json格式，同时支持网络请求
                dataType:2,                         //分页列表数据获取方式，1、回调函数方式，2、回调函数参数方式，3、js静态变量，但是会优先判断ajaxDataCallback参数
                currentListData:[],
                maxBtnNum:5,                        //数字按钮个数 暂时废弃 改为使用siteBtnNum
                siteBtnNum:2,
                needFirstBtn: false,
                needLastBtn: false,
                firstText: '第一页',
                firstClass: 'page-first-btn',
                //prevText: '上一页',
                prevText: '<span class="icon-arrow"></span>',
                //prevClass: 'page-prev-btn',
                prevClass: 'pages-prev',                
                //nextText: '下一页',
                nextText: '<span class="icon-arrow"></span>',
                //nextClass: 'page-next-btn',
                nextClass: 'pages-next',
                lastText: '最后一页',
                lastClass: 'page-last-btn',
                numClass: 'page-num-btn',
                btnClass: 'page-btn',
                totalNum:false,
                totalPage:false,
                prevBtn:true,
                nextBtn:true,
                currentClass:'active',
                total:0,
                perPageNum:10,
                numBtnTag:'a',
                pageToolWrapTag:'div',
                pageToolWrapId:'page_tool_wrap',
                pageToolContainer:false,
                pageToolWrapClass:'page-tool-wrap',
                pageListWrapId:'page_list_wrap',
                pageListContainer:false,
                ajaxDataUrl:'',
                ajaxFormData:{},
                ajaxFormPageParamName:'page',
                ajaxDataCallback:false,
            }
            // 创建配置和传进来的配置信息合并
            if (arguments[0] && typeof arguments[0] === "object")
            {
                this.options = extendDefaults(defaults, arguments[0]);
            }
            var _this = this;
            this.go(1);

        }


        //可定制化配置
        function extendDefaults(source, properties)
        {
            var property;
            for (property in properties)
            {
                if (properties.hasOwnProperty(property))
                {
                    source[property] = properties[property];
                }
            }
            return source;
        }

        Page.prototype =
        {
            //分页按钮及相关信息 考虑转为私有函数
            createToolHtml:function(page)
            {
                page = parseInt(page);
                var countPage = this.countPage();

                //如果小于等于1页 就不需要分页 直接返回空字符串
                if (countPage<=1)
                {
                    return '';
                }


                var options = this.options;

                var btnHtml      = '',
                    firstBtnHtml = '',
                    prevBtnHtml  = '',
                    nextBtnHtml  = '',
                    lastBtnHtml  = '',
                    max          = 0,
                    starNum      = 2,
                    currentClass = '';


                //var siteBtnNum = Math.floor(this.options.maxBtnNum/2); //两边需要放多少个按钮 采用舍去小数点取整方式 maxBtnNum暂时废弃
                var siteBtnNum = options.siteBtnNum;

                if (page == 1)
                {
                    currentClass = options.currentClass;
                }

                if (options.numBtnTag=='a')
                {
                    numBtnTag = 'a href="javascript:;" ';
                }

                /*
                //旧算法已注释
                if (options.needFirstBtn)
                {
                    btnHtml += '<'+options.numBtnTag+' class="'+options.firstClass+' '+options.btnClass+'" page = "1">'+options.firstText+'</'+options.numBtnTag+'>';//第一页按钮
                }


                //上一页
                if (page > 1 && options.prevBtn)
                {
                    btnHtml += '<'+options.numBtnTag+' class="'+options.prevClass+' '+options.btnClass+'" page = "'+(page-1)+'">'+options.prevText+'</'+options.numBtnTag+'>';
                }


                btnHtml += '<'+options.numBtnTag+' class="'+options.btnClass+' '+currentClass+'" page = "1">'+1+'</'+options.numBtnTag+'>';//数字1按钮

                //根据当前页和设定的数字按钮个数来计算起始数字 一般当前页两边分别平均的放置对等个数的数字按钮
                

                //如果当前page减去第一页1的差数 大于两边的个数则需要加上省略号 小于等于则不需要 这里需要注意：比如4-1=3 但是1和4之间其实是只有2个数 就是两个按钮，所以需要再将它减去1
                var frontCount = page - 1 - 1 ;

                if (frontCount>siteBtnNum && (siteBtnNum*2)<countPage )
                {
                    btnHtml += '<'+options.numBtnTag+' class="'+options.btnClass+'" page = "">...</'+options.numBtnTag+'>';
                    starNum = page-siteBtnNum;
                }*/

                //----------------------------------------------------------------新算法 START
                var btnArr = [];

                //当前页前面的按钮
                //总共多少页 countPage
                //两边设置要多少 siteBtnNum
                //实际有多少 
                var realNum = page-1
                
                //从当前往前生成按钮
                var num = realNum > siteBtnNum ? siteBtnNum : realNum,
                    frontBtnArr = [];
                for (var i = 1; i <= num ; i++) 
                {
                    var tempNo = page-i;
                    var temp   = '<'+options.numBtnTag+' class="'+options.btnClass+'" page = "'+tempNo+'"> '+tempNo+' </'+options.numBtnTag+'>';
                    frontBtnArr.unshift(temp);
                }

                //如果实际按钮大于设置按钮个数，这时就要加...和1了
                if (realNum>siteBtnNum)
                {
                    var temp = '';
                    
                    if ((realNum-1) > siteBtnNum)
                    {
                        temp = '<'+options.numBtnTag+' class="'+options.btnClass+'" page = "">...</'+options.numBtnTag+'>';
                        frontBtnArr.unshift(temp);
                    }
                    
                    temp = '<'+options.numBtnTag+' class="'+options.btnClass+'" page = "1">'+1+'</'+options.numBtnTag+'>';
                    frontBtnArr.unshift(temp);
                }

                //生成当前按钮插入frontBtnArr
                var temp   = '<'+options.numBtnTag+' class="'+options.btnClass+' '+options.currentClass+'" page = "'+page+'"> '+page+' </'+options.numBtnTag+'>';
                frontBtnArr.push(temp);

                //上一页按钮
                if (page > 1 && options.prevBtn)
                {
                    var temp = '<'+options.numBtnTag+' class="'+options.prevClass+' '+options.btnClass+'" page = "'+(page-1)+'">'+options.prevText+'</'+options.numBtnTag+'>';
                    frontBtnArr.unshift(temp);
                }

                //第一页按钮
                if (options.needFirstBtn)
                {
                    var temp = '<'+options.numBtnTag+' class="'+options.firstClass+' '+options.btnClass+'" page = "1">'+options.firstText+'</'+options.numBtnTag+'>';
                    frontBtnArr.unshift(temp);
                }


                //当前页后面的按钮
                //总共多少页 countPage
                //两边设置要多少 siteBtnNum
                //实际有多少 
                realNum = countPage-page;

                //从当前往后面生成按钮
                var num = realNum > siteBtnNum ? siteBtnNum : realNum,
                    afterBtnArr = [];
                for (var i = 1; i<=num ; i++) 
                {
                    var tempNo = page+i;
                    var temp   = '<'+options.numBtnTag+' class="'+options.btnClass+'" page = "'+tempNo+'"> '+tempNo+' </'+options.numBtnTag+'>';

                    afterBtnArr.push(temp);
                }

                //如果实际按钮大于设置按钮个数，这时就要加...和countPage了
                if (realNum>siteBtnNum)
                {
                    var temp = '';
                    if ( (realNum-1) > siteBtnNum)
                    {
                        temp = '<'+options.numBtnTag+' class="'+options.btnClass+'" page = "">...</'+options.numBtnTag+'>';
                        afterBtnArr.push(temp);
                    }
                    temp = '<'+options.numBtnTag+' class="'+options.btnClass+'" page = "'+countPage+'">'+countPage+'</'+options.numBtnTag+'>';
                    afterBtnArr.push(temp);
                }
                btnArr = frontBtnArr.concat(afterBtnArr);

                //下一页按钮
                if (page < countPage && options.nextBtn)
                {
                    var temp = '<'+options.numBtnTag+' class="'+options.nextClass+' '+options.btnClass+'" page = "'+(page+1)+'">'+options.nextText+'</'+options.numBtnTag+'>';
                    btnArr.push(temp);
                }

                //最后一页按钮
                if (options.needLastBtn)
                {
                    var temp = '<'+options.numBtnTag+' class="'+options.lastClass+' '+options.btnClass+'" page = "'+countPage+'">'+options.lastText+'</'+options.numBtnTag+'>';
                    btnArr.push(temp);
                }

                return btnArr.join('');

                //----------------------------------------------------------------新算法 END

                /*
                //旧算法已注释
                max = countPage > options.maxBtnNum ? options.maxBtnNum : countPage;
                for(var i = 0; i < max; i++)
                {

                    var pageNum      = starNum+i;
                    currentClass = '';
                    if (page == pageNum)
                    {
                        currentClass = options.currentClass;
                    }
                    btnHtml += '<'+options.numBtnTag+' class="'+options.btnClass+' '+currentClass+'" page = "'+pageNum+'"> '+pageNum+' </'+options.numBtnTag+'>';
                    if (pageNum>=countPage)
                    {
                        break;
                    }
                }

                //如果最大页数减去当前page的差数 大于两边的个数则需要加上省略号 小于等于则不需要 和上面类似这里需要注意：比如100-97=3 但是97和100之间其实是只有2个数 就是两个按钮，所以需要再将它减去1
                var afterCount = countPage - page - 1;
                if (afterCount>siteBtnNum)
                {
                    btnHtml += '<'+options.numBtnTag+' class="'+options.btnClass+'" page = "">...</'+options.numBtnTag+'>';

                    currentClass = '';
                    if (page == countPage)
                    {
                        currentClass = options.currentClass;
                    }
                    btnHtml += '<'+options.numBtnTag+' class="last-page-btn '+options.btnClass+' '+currentClass+'" page = "'+countPage+'">'+countPage+'</'+options.numBtnTag+'>';//最后数字按钮
                }
                //
                if (afterCount==siteBtnNum)
                {
                    //btnHtml += '<'+options.numBtnTag+' class="last-page-btn2 '+options.btnClass+' '+currentClass+'" page = "'+countPage+'">'+countPage+'</'+options.numBtnTag+'>';//最后数字按钮
                }

                //下一页
                if (page < countPage && options.nextBtn)
                {
                    btnHtml += '<'+options.numBtnTag+' class="'+options.nextClass+' '+options.btnClass+'" page = "'+(page+1)+'">'+options.nextText+'</'+options.numBtnTag+'>';
                }

                if (options.needLastBtn)
                {
                    btnHtml += '<'+options.numBtnTag+' class="'+options.lastClass+' '+options.btnClass+'" page = "'+countPage+'">'+options.lastText+'</'+options.numBtnTag+'>';//最后一页按钮
                }


                btnHtml = firstBtnHtml+prevBtnHtml+btnHtml+nextBtnHtml+lastBtnHtml;

                var totalPageHtml = '',
                    totalNumHtml  = '';

                if (options.totalNum)
                {
                    totalNumHtml  = '<'+options.numBtnTag+' class="'+options.btnClass+'" >共'+options.total+'条</'+options.numBtnTag+'>';
                }

                if (options.totalPage)
                {
                    totalPageHtml = '<'+options.numBtnTag+' class="'+options.btnClass+'" >共'+countPage+'页</'+options.numBtnTag+'>';
                }

                var pageToolHtml = '<'+options.pageToolWrapTag+' class="'+options.pageToolWrapClass+'" >'+btnHtml+totalPageHtml+totalNumHtml+'</'+options.pageToolWrapTag+'>';
                return pageToolHtml;
                */
            },

            //根据当前配置获取总页数
            countPage:function()
            {
                return Math.ceil(this.options.total/this.options.perPageNum);
            },

            //列表
            createPageListHtml:function(param)
            {

            },



            //原生ajax
            ajax:function(param)
            {
                var success = param.success || function(){},
                    url     = param.url || '',
                    data    = param.data || {},
                    dataArr = [],
                    dataStr = '';

                for(var k in data)
                {
                    dataArr.push(k+'='+data[k]);
                }
                dataStr = join('&',dataArr);

                var xmlhttp;

                if (window.XMLHttpRequest)
                {// code for IE7+, Firefox, Chrome, Opera, Safari
                    xmlhttp=new XMLHttpRequest();
                }
                else
                {// code for IE6, IE5
                    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
                }
                xmlhttp.onreadystatechange=function()
                {
                    if (xmlhttp.readyState==4 && xmlhttp.status==200)
                    {
                        success(xmlhttp.responseText);
                    }
                }
                xmlhttp.open("POST",url,true);
                xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                xmlhttp.send(dataStr);
            },

            //列表
            getAjaxListData:function(page)
            {
                var data = this.options.ajaxFormData;
                data[this.options.ajaxDataUrl] = page;
                this.ajax({
                    type:'POST',
                    data:data,
                    url:this.options.ajaxDataUrl,
                    success:function(){
                        go();
                    },
                })
            },

            //获取分页列表数据 暂时不用
            getListData:function(page)
            {
                var listData = [];
                if (this.options.data.length>0)
                {
                    this.options.total = this.options.data.length;
                    var countPage      = this.countPage();
                    if (page <= countPage)
                    {
                        var offset = page*this.perPageNum;
                        var limit  = this.perPageNum;
                        for(var k = offset; k<offset+limit;k++)
                        {
                            listData.push(this.options.data[k]);
                        }
                    }
                }
                else
                {
                    this.getAjaxListData();
                }
                return listData;
            },

            //按js变量方式获取分页是数据
            getStaticListData:function(page)
            {
                var listData = [];
                if (this.options.data.length>0)
                {
                    this.options.total = this.options.data.length;
                    var countPage      = this.countPage();

                    if (page <= countPage)
                    {
                        var offset = (page-1)*this.options.perPageNum;
                        var limit  = this.options.perPageNum;
                        for(var k = offset; k<offset+limit;k++)
                        {
                            if (this.options.data[k])
                            {
                                listData.push(this.options.data[k]);
                            }
                            
                        }
                    }
                }
                return listData;
            },

            //分页跳转
            go:function(page)
            {
                //优先按ajax动态回调请求列表数据
                if(typeof this.options.ajaxDataCallback == 'function')
                {
                    this.options.ajaxDataCallback(this,page);
                    return;
                }
                else
                {
                    switch(this.options.dataType)
                    {
                        //回调函数参数形式
                        case 2:
                            this.getAjaxListData();
                            return;
                            break;

                        //js变量形式
                        case 3:

                            var listData = this.getStaticListData(page);
                            if(typeof this.options.listItemFactory == 'function')
                            {
                                var listHtml = this.options.listItemFactory(listData);
                                this.setPageListHtml(listHtml);
                            }
                            var html     = this.createToolHtml(page);
                            this.setPageToolHtml(html);
                            break;
                    }
                }

            },
            //给按钮添加点击事件
            addEventListener:function()
            {

                if (this.options.pageToolContainer)
                {
                   var pageToolWrap = this.options.pageToolContainer;
                }
                else
                {
                    var pageToolWrap = document.getElementById(this.options.pageToolWrapId);
                }


                var btns = pageToolWrap.getElementsByTagName(this.options.numBtnTag);

                var _this = this;

                var pageBtnClickListener = function(elem)
                {
                    if (!elem.attributes['page'])
                    {
                        return;
                    }
                    var page = elem.attributes['page'].nodeValue;

                    if (page)
                    {
                        _this.go(page);
                    }
                }

                var length = btns.length;
                if(window.addEventListener)
                { // Mozilla, Netscape, Firefox
                    
                    for(var k=0;k<length;k++)
                    {
                        btns[k].addEventListener('click', function(){
                            pageBtnClickListener(this);
                        }, false);
                    }
                }
                else
                { // IE
                    for(var k=0;k<length;k++)
                    {
                        btns[k].attachEvent('onclick', function(){
                            pageBtnClickListener(this);
                        });
                    }
                }
            },

            //更新分页按钮html内容 考虑转为私有函数
            setPageToolHtml:function(html)
            {
                if (this.options.pageToolContainer)
                {
                    this.options.pageToolContainer.innerHTML = html;
                }
                else
                {
                    var pageToolWrap = document.getElementById(this.options.pageToolWrapId);
                    pageToolWrap.innerHTML = html;
                }

                this.addEventListener();
            },

            //更新分页按钮html内容 供外部调用公有函数
            reloadPageToolHtml:function(page)
            {
                var html = this.createToolHtml(page);
                this.setPageToolHtml(html);
            },



            //更新分页列表html内容 考虑转为私有函数
            setPageListHtml:function(html)
            {
                if (this.options.pageListContainer)
                {
                    this.options.pageListContainer.innerHTML = html;
                }
                else
                {
                    var pageListWrap = document.getElementById(this.options.pageListWrapId);
                    pageListWrap.innerHTML = html;
                }
            },

            //更新分页列表html内容 供外部调用公有函数
            reloadPageListHtml:function(listData)
            {
                if(typeof this.options.listItemFactory == 'function')
                {
                    var listHtml = this.options.listItemFactory(listData);
                    this.setPageListHtml(listHtml);
                }
            },

            //更新分页列表html内容 供外部调用公有函数
            onAjaxDataDone:function(list,total,page)
            {
                this.options.total = total;
                this.reloadPageListHtml(list);
                this.reloadPageToolHtml(page);
            },
        }

        window.Page = Page;

    })(window);
    module.exports = Page;
})
