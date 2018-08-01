(function(a){a.fn.msword_html_filter=function(g){function h(b){var c=b.html();c=c.replace(/\x3c!--[\s\S]+?--\x3e/gi,"");c=c.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,"");c=c.replace(/<(\/?)s>/gi,"<$1strike>");c=c.replace(/&nbsp;/gi," ");c=c.replace(/<span\s+style\s*=\s*"\s*mso-spacerun\s*:\s*yes\s*;?\s*"\s*>([\s\u00a0]*)<\/span>/gi,function(a,d){return 0<d.length?d.replace(/./," ").slice(Math.floor(d.length/2)).split("").join("\u00a0"):
""});b.html(c);a("p",b).each(function(){var b=a(this).attr("style");(b=/mso-list:\w+ \w+([0-9]+)/.exec(b))&&a(this).data("_listLevel",parseInt(b[1],10))});var e=0,f=null;a("p",b).each(function(){var b=a(this).data("_listLevel");if(void 0!=b){var d=a(this).text(),c="<ul></ul>";/^\s*\w+\./.test(d)&&((d=/([0-9])\./.exec(d))?(d=parseInt(d[1],10),c=1<d?'<ol start="'+d+'"></ol>':"<ol></ol>"):c="<ol></ol>");b>e&&(0==e?(a(this).before(c),f=a(this).prev()):f=a(c).appendTo(f));if(b<e)for(d=0;d<e-b;d++)f=f.parent();
a("span:first",this).remove();f.append("<li>"+a(this).html()+"</li>");a(this).remove();e=b}else e=0});a("[style]",b).removeAttr("style");a("[align]",b).removeAttr("align");a("span",b).replaceWith(function(){return a(this).contents()});a("span:empty",b).remove();a("[class^='Mso']",b).removeAttr("class");a("p:empty",b).remove()}a.extend({},g);return this.each(function(){a(this).on("keyup",function(){a("#src").text(a("#editor").html());var b=a(this).html();/class="?Mso|style="[^"]*\bmso-|style='[^'']*\bmso-|w:WordDocument/i.test(b)&&
h(a(this))})})}})(jQuery);

function tsxEdClass(){
	this.eid = 0;
	this.param = {};
	this.textarea = {};
	this.font_array = {
		arial:'Arial, Helvetica, sans-serif',
		georgia:'Georgia, serif',
		tahoma:'Tahoma, Geneva, sans-serif',
		times:'\'Times New Roman\', Times, serif',
		verdana:'Verdana, Geneva, sans-serif'
	};
	var self=this;
	
	this.init = function(p){
		document.execCommand("defaultParagraphSeparator", false, "p");
		if(p && p.targ && $(p.targ).length){
			self.eid = 'tsx'+self.uid();
			self.textarea[self.eid] = p.targ;
			var tahtml = $(p.targ).val();
			tahtml = (tahtml)?tahtml:'';
			var toolslist = '';
			if(p && p.tools){
				var toolarr = p.tools.split(',');
				for(var i in toolarr){
					if(self.tools[toolarr[i]].button){
						toolslist += self.tools[toolarr[i]].button({id:self.eid});
					};
				}
			}
			var tools = (toolslist)?'<div data-id="'+self.eid+'" class="tce_tools_c">'+toolslist+'</div>':'';
			$(p.targ).before('<div id="'+self.eid+'" class="tce_content_c">'+tools+'<div contenteditable="true" class="tce_content">'+tahtml+'</div></div>').hide();
			$('#'+self.eid).on('paste', function(e){
				var xid = $(e.target).parents('.tce_content_c').attr('id');
				self.pasteFormat({e:e,id:xid});
			});
			$('#'+self.eid).on('keyup', function(e){
				var xid = $(e.target).parents('.tce_content_c').attr('id');
				self.keyUp({e:e,id:xid});
			});
			$('#'+self.eid).on('mousedown','.tce_tools_c',function(e){
				var xid = $(this).attr('data-id');
				$('#'+xid+' .tce_content').focus();
			});
			$('#'+self.eid+' .tce_content').on('click','img,p,h1,h2,h3,h4,li,ul,ol,td,th,table,blockquote,a,b,strong,i,em,u,s,strike,span',function(e){
				e.stopPropagation();
				self.editElm({e:e,t:this});
			});
			$('#'+self.eid).on('mousedown','.tce_tools_btn,.tce_tools_numric_up,.tce_tools_numric_dw',function(e){
				var xid = $(this).parents('.tce_content_c').attr('id');
				self.saveRange({id:xid});
			});
			$('#'+self.eid).on('click','.tce_tools_btn',function(e){
				var xid = $(this).parents('.tce_content_c').attr('id');
				if(xid){
					$('#'+xid+' .tce_content').focus();
					self.restoreRange({id:xid});
					e.stopPropagation();
					$(this).parent().find('.tce_tools_btn_active').removeClass('tce_tools_btn_active');
					var action = $(this).attr('data-action');
					var val = $(this).attr('data-val');
					if(action && self.tools[action].apply){
						self.tools[action].apply({val:val,id:xid});
					}
					$(this).addClass('tce_tools_btn_active');
				}
			});
			document.addEventListener('keydown', self.keyCode);
			return self.eid;
		}
	}
	
	this.tools = {
		/*******/
		format:{
			button:function(p){ return self.getOption({name:'format',id:p.id,options:[{name:'Заголовок 1',val:'h1',css:'h1'},{name:'Заголовок 2',val:'h2',css:'h2'},{name:'Заголовок 3',val:'h3',css:'h3'},{name:'Заголовок 4',val:'h4',css:'h4'},{name:'Параграф',val:'p',selected:true,css:'p'},{name:'Цитата',val:'blockquote',css:'blockquote'}]}); },
			apply:function(p){
				var xid = p.id;
				if(xid && typeof self.param[xid] != 'undefined'){
					if(self.param[xid].conttagname=='h1' || self.param[xid].conttagname=='h2' || self.param[xid].conttagname=='h3' || self.param[xid].conttagname=='h4' || self.param[xid].conttagname=='p' || self.param[xid].conttagname=='blockquote'){
						$(self.param[xid].cont).replaceWith(function(index, oldHTML){return $('<'+p.val+' id="tce-replacer">').html(oldHTML); });
						self.detectEl({id:'#'+xid+' #tce-replacer'});
						$('#'+xid+' #tce-replacer').removeAttr('id');
					}
				}
			},
			sel:function(p){
				var xid = p.id;
				if(p && xid && p.tn){
					if($('#'+xid+' .tce_tools_select_format .tce_tools_select_option.'+p.tn).length){
						$('#'+xid+' .tce_tools_select_format .tce_tools_selected').removeClass('tce_tools_selected');
						$('#'+xid+' .tce_tools_select_format .tce_tools_select_option.'+p.tn).addClass('tce_tools_selected');
					}
				}
			}
		},
		/*******/
		align:{
			button:function(p){return '<span class="tce_tools_btn_c tce_btn_align_c"><span data-action="align" data-val="left" title="По левому краю" class="tce_tools_btn tce_align-left"></span><span data-action="align" data-val="center" title="По центру" class="tce_tools_btn tce_align-center"></span><span data-action="align" data-val="right" title="По правому краю" class="tce_tools_btn tce_align-right"></span><span data-action="align" data-val="justify" title="По ширине" class="tce_tools_btn tce_align-justify"></span></span>'; },
			apply:function(p){
				var xid = p.id;
				if(xid && typeof self.param[xid] != 'undefined'){
					if(self.param[xid].conttagname=='h1' || self.param[xid].conttagname=='h2' || self.param[xid].conttagname=='h3' || self.param[xid].conttagname=='h4' || self.param[xid].conttagname=='p' || self.param[xid].conttagname=='blockquote'){
						if(p.val){
							$(self.param[xid].cont).css('text-align',p.val); 
							$('#'+xid+' .tce_btn_align_c .tce_tools_btn.tce_tools_btn_active').removeClass('tce_tools_btn_active');
							$('#'+xid+' .tce_tools_btn.tce_align-'+p.val).addClass('tce_tools_btn_active');
						}
					}
				}
			},
			sel:function(p){
				var xid = p.id;
				if(p && xid && p.tn){
					var val = $(self.param[xid].cont).css('text-align');
					val = (val=='start')?'left':val;
					$('#'+xid+' .tce_btn_align_c .tce_tools_btn.tce_tools_btn_active').removeClass('tce_tools_btn_active');
					$('#'+xid+' .tce_tools_btn.tce_align-'+val).addClass('tce_tools_btn_active');
				}
			}
		},
		/*******/
		mark:{
			button:function(p){return '<span class="tce_tools_btn_c tce_btn_mark_c"><span data-action="mark" data-val="bold" title="Жирный" class="tce_tools_btn tce_mark-b"></span><span data-action="mark" data-val="italic" title="Курсив" class="tce_tools_btn tce_mark-i"></span><span data-action="mark" data-val="underline" title="Подчеркнутый" class="tce_tools_btn tce_mark-u"></span><span data-action="mark" data-val="strikethrough" title="Перечеркнутый" class="tce_tools_btn tce_mark-s"></span></span>'; },
			apply:function(p){
				var xid = p.id;
				if(xid && typeof self.param[xid] != 'undefined'){
					var wgsel = window.getSelection();
					if(typeof wgsel != 'undefind' && wgsel.isCollapsed){
						if($(self.param[xid].el).parents('.tce_content').length && (self.param[xid].tagname=='b' || self.param[xid].tagname=='strong' || self.param[xid].tagname=='i' || self.param[xid].tagname=='em' || self.param[xid].tagname=='u' || self.param[xid].tagname=='s' || self.param[xid].tagname=='strike' || self.param[xid].tagname=='span')){
							var val = '';
							if(p.val=='bold'){
								val = 'strong';
							}else if(p.val=='italic'){
								val = 'em';
							}else if(p.val=='underline'){
								val = 'u';
							}else if(p.val=='strikethrough'){
								val = 'strike';
							}
							$(self.param[xid].el).replaceWith(function(index, oldHTML){return $('<'+val+' id="tce-replacer">').html(oldHTML); });
							self.detectEl({id:'#'+xid+' #tce-replacer'});
							$('#'+xid+' #tce-replacer').removeAttr('id');
						}
					}else{
						if(wgsel.rangeCount > 0){
							var range = wgsel.getRangeAt(0);
							if($(range.commonAncestorContainer).parents('.tce_content').length){
								document.execCommand(p.val);
							}
						}
					};
				}
			},
			sel:function(p){
				var xid = p.id;
				if(p && xid && p.tn){
					var val = '';
					if(p.tn=='span'){
						if($(self.param[xid].el).css('text-decoration-line')=='line-through'){
							$('#'+xid+' .tce_tools_btn.tce_mark-s').addClass('tce_tools_btn_active');
						}else if($(self.param[xid].el).css('text-decoration-line')=='underline'){
							$('#'+xid+' .tce_tools_btn.tce_mark-u').addClass('tce_tools_btn_active');
						};
					}else{
						if(p.tn=='strong'){val = 'b'; }else if(p.tn=='em'){val = 'i';}else if(p.tn=='strike'){val = 's';}else{val = p.tn; };
						$('#'+xid+' .tce_tools_btn.tce_mark-'+val).addClass('tce_tools_btn_active');
					}
				}
			}
		},
		/*******/
		font:{
			button:function(p){ return self.getOption({name:'font',id:p.id,options:[{name:'Arial',selected:true,val:'arial',css:'arial'},{name:'Georgia',val:'georgia',css:'georgia'},{name:'Tahoma',val:'tahoma',css:'tahoma'},{name:'Times New',val:'times',css:'times'},{name:'Verdana',val:'verdana',css:'verdana'}]}); },
			apply:function(p){
				var xid = p.id;
				if(xid && typeof self.param[xid] != 'undefined'){
					if(self.param[xid].conttagname=='h1' || self.param[xid].conttagname=='h2' || self.param[xid].conttagname=='h3' || self.param[xid].conttagname=='h4' || self.param[xid].conttagname=='p' || self.param[xid].conttagname=='blockquote'){
						if(self.font_array[p.val]){
							$(self.param[xid].cont).css('font-family',self.font_array[p.val]);
						}
					}
				}
			},
			sel:function(p){
				var xid = p.id;
				if(p && xid && p.tn){
					font = $(self.param[xid].cont).css('font-family').split(' ');
					font = font[0].replace(',','').replace("'","").replace('"','').toLowerCase();
					$('#'+xid+' .tce_tools_select_font .tce_tools_selected').removeClass('tce_tools_selected');
					$('#'+xid+' .tce_tools_select_font .tce_tools_select_option.'+font).addClass('tce_tools_selected');
				}
			}
		},
		/*******/
		fontsize:{
			button:function(p){return '<span class="tce_tools_numric_c tce_btn_fontsize_c"><span data-min="9" data-max="46" class="tce_tools_numric_tx">14</span><span onClick="tsxEd.numberPlus({t:this,action:\'fontsize\',id:\''+p.id+'\'});" class="tce_tools_numric_up"></span><span onClick="tsxEd.numberPlus({t:this,s:1,action:\'fontsize\',id:\''+p.id+'\'});" class="tce_tools_numric_dw"></span></span>'; },
			apply:function(p){
				var xid = p.id;
				if(xid && typeof self.param[xid] != 'undefined'){
					var wgsel = window.getSelection();
					if(wgsel.isCollapsed){
						if(self.param[xid].tagname=='span'){
							$(self.param[xid].el).css('font-size',p.val+'px');
							return true;
						}else if(self.param[xid].conttagname=='h1' || self.param[xid].conttagname=='h2' || self.param[xid].conttagname=='h3' || self.param[xid].conttagname=='h4' || self.param[xid].conttagname=='p' || self.param[xid].conttagname=='blockquote'){
							$(self.param[xid].cont).css('font-size',p.val+'px');
							return true;
						}
					}else{
						if(wgsel.rangeCount > 0){
							var range = wgsel.getRangeAt(0);
							if($(range.commonAncestorContainer).parents('.tce_content').length){
								var spanString = $('<span/>', {
									'text': document.getSelection()
								}).css('font-size', p.val+'px').attr('id','tce-replacer').prop('outerHTML');
								document.execCommand('insertHTML', false, spanString);
								self.detectEl({id:'#'+xid+' #tce-replacer'});
								$('#'+xid+' #tce-replacer').removeAttr('id');
								return true;
							}
						}
					};
				}
			},
			sel:function(p){
				var xid = p.id;
				if(p.etn=='span'){
					var fs = $(self.param[xid].el).css('font-size');
				}else if(p.tn=='h1' || p.tn=='h2' || p.tn=='h3' || p.tn=='h4' || p.tn=='p' || p.tn=='blockquote'){
					var fs = $(self.param[xid].cont).css('font-size');
				}
				if(fs){
					var n = parseInt(fs);
					if(n){
						$('#'+xid+' .tce_btn_fontsize_c .tce_tools_numric_tx').text(n);
					}
				}
			}
		},
		/*******/
		blank:{
			button:function(p){},
			apply:function(p){},
			sel:function(p){}
		}
	};
	
	this.saveArea = function(p){
		if(p && p.id){
			var tar = $('#'+p.id+' .tce_content');
			if(tar.length){
				var cont = tar.html();
				$(self.textarea[p.id]).val(cont);
				if(typeof p.callback=='function'){
					p.callback({id:p.id, ta:self.textarea[p.id]});
				}
				if(p.return){
					return cont;
				}
			}
		};
	}
	
	this.numberPlus = function(p){
		if(p && p.t){
			self.restoreRange({id:p.id});
			var tx = $(p.t).parent().find('.tce_tools_numric_tx');
			var min = (tx.attr('data-min'))?parseInt(tx.attr('data-min')):0;
			var max = (tx.attr('data-max'))?parseInt(tx.attr('data-max')):0;
			var n = tx.text(); n = (n)?parseInt(n):min;
			if(p.s){
				var n2 = ((n-1) >= min)? n-1 : n;
			}else{
				var n2 = ((n+1) <= max)? n+1 : n;
			}
			if(n != n2){
				if(p.action && self.tools[p.action].apply){
					if(self.tools[p.action].apply({val:n2,id:p.id})){
						tx.text(n2);
					};
				}
			}
		}
	}
	
	this.editElm = function(p){
		var xid = self.detectEl({t:p.t});
		if(xid){
			$('#'+xid+' .tce_btn_mark_c .tce_tools_btn.tce_tools_btn_active').removeClass('tce_tools_btn_active');
			if(self.param[xid].conttagname=='h1' || self.param[xid].conttagname=='h2' || self.param[xid].conttagname=='h3' || self.param[xid].conttagname=='h4' || self.param[xid].conttagname=='p' || self.param[xid].conttagname=='blockquote'){
				self.tools['format'].sel({tn:self.param[xid].conttagname,id:xid});
				self.tools['font'].sel({tn:self.param[xid].conttagname,id:xid});
				self.tools['fontsize'].sel({tn:self.param[xid].conttagname,etn:self.param[xid].tagname,id:xid});
				self.tools['align'].sel({tn:self.param[xid].conttagname,id:xid});
			}
			if(self.param[xid].tagname=='b' || self.param[xid].tagname=='strong' || self.param[xid].tagname=='i' || self.param[xid].tagname=='em' || self.param[xid].tagname=='u' || self.param[xid].tagname=='s' || self.param[xid].tagname=='strike' || self.param[xid].tagname=='span'){
				self.tools['mark'].sel({tn:self.param[xid].tagname,id:xid});
			}
		}
	}
	
	this.detectEl = function(p){
		var xid = false;
		var el = false;
		if(p && p.t){
			var el = $(p.t);
		}else if(p && p.id){
			var el = $(p.id);
		}
		if(el!=false){
			xid = el.parents('.tce_content_c').attr('id');
			if(xid){
				var tagName = el.get(0).tagName.toLowerCase();
				var cont = el;
				var contTagName = tagName;
				if(tagName != 'p' || tagName != 'ul' || tagName != 'ol'){
					var contx = el.parents('p:first');
					if(contx.length){
						cont = contx;
						contTagName = contx.get(0).tagName.toLowerCase();
					}
				}
				self.param[xid]={};
				self.param[xid]['tagname'] = tagName;
				self.param[xid]['conttagname'] = contTagName;
				self.param[xid]['cont'] = cont;
				self.param[xid]['el'] = el;
				return xid;
			}
		}
	}
	
	this.getOption = function(p){
		var a = '';
		if(p && p.options && p.name){
			a += '<span onClick="$(this).addClass(\'tce_tools_select_activate\');" class="tce_tools_select_c tce_tools_select_'+p.name+'"><span class="tce_tools_select">';
			for(var i in p.options){
				if(p.options[i].val){
					var sel = (p.options[i].selected)?' tce_tools_selected':'';
					var css = (p.options[i].css)?' '+p.options[i].css:'';
					a += '<span onClick="tsxEd.getOptionVal(this);" data-id="'+p.id+'" data-name="'+p.name+'" data-value="'+p.options[i].val+'" class="tce_tools_select_option'+sel+css+'">'+p.options[i].name+'</span>';
				}
			}
			a += '</span></span>';
		}
		return a;
	}
	
	this.getOptionVal = function(t){
		if(t && $(t).parents('.tce_tools_select_activate').length){
			var val = $(t).attr('data-value');
			val = (val)?val:'';
			var name = $(t).attr('data-name');
			var id = $(t).attr('data-id');
			if(name && self.tools[name].apply){
				self.tools[name].apply({val:val,t:t,id:id});
				$(t).parent().find('.tce_tools_selected').removeClass('tce_tools_selected');
				$(t).addClass('tce_tools_selected');
				setTimeout(function(){$(t).parents('.tce_tools_select_activate').removeClass('tce_tools_select_activate'); },0.1);
			}
		}
	}
	
	this.keyUp = function(p){
		if(p.e && p.e.keyCode==8){
			var xid = p.id;
			if($('#'+xid+' .tce_content p, #'+xid+' .tce_content div, #'+xid+' .tce_content h1, #'+xid+' .tce_content h2, #'+xid+' .tce_content h3, #'+xid+' .tce_content h4, #'+xid+' .tce_content blockquote, #'+xid+' .tce_content ul, #'+xid+' .tce_content ol').length){
				// skip
			}else{
				document.execCommand('insertHTML', false, '<p id="tce-replacer"></p>');
				self.detectEl({id:'#'+xid+' #tce-replacer'});
				$('#'+xid+' #tce-replacer').removeAttr('id');
			};
		}
	}
	
	this.pasteFormat = function(p){
		if(p.id){
			$('#'+p.id+' .tce_content').msword_html_filter();
		}
	}
	
	this.uid = function(){
		return '_' + Math.random().toString(36).substr(2, 9);
	}
	
	this.saveRange = function(p){
		if(p && p.id && typeof self.param[p.id] != 'undefined'){
			self.param[p.id]['range'] = null;
			var wgsel = window.getSelection();
			if(wgsel.rangeCount > 0){
				self.param[p.id]['range'] = wgsel.getRangeAt(0);
			}
		}
	}
	
	this.restoreRange = function(p){
		if(p && p.id && typeof self.param[p.id] != 'undefined'){
			var range = self.param[p.id].range;
			if(range){
				if(window.getSelection){
					s = window.getSelection();
					if(s.rangeCount > 0){s.removeAllRanges(); };
					s.addRange(range);
				}
			}
		}
	}
	
}
var tsxEd = new tsxEdClass();