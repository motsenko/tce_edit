/* TCE EDIT Open Source  |  https://github.com/tsenix/tce_edit  |   https://tsenix.com  */
function tsxEdClass(){
	this.eid = 0;
	this.custom_style = [{n:'Таблица с рамками',v:'price'}];
	this.param = {};
	this.tmp = [];
	this.activelink = false;
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
			if(tahtml.trim()==''){tahtml='<p></p>';}
			tahtml = (tahtml)?tahtml.replace(new RegExp('src="edit/uploads','gm'),'src="/edit/uploads'):'';
			var toolslist = '';
			if(p && p.tools){
				var toolarr = p.tools.split(',');
				for(var i in toolarr){
					if(typeof self.tools[toolarr[i]] != 'undefined' && typeof self.tools[toolarr[i]].button != 'undefined'){
						toolslist += self.tools[toolarr[i]].button({id:self.eid});
					};
				}
			}
			if(p && p.styles){
				var stylesarr = p.styles.split(',');
				for(var psi1 in stylesarr){
					if(stylesarr[psi1]){
						var stylesarr2 = stylesarr[psi1].split(';');
						if(stylesarr2[1]){
							self.custom_style.push({n:stylesarr2[0],v:stylesarr2[1]});
						}else{
							self.custom_style.push({n:stylesarr2[0],v:stylesarr2[0]});
						}
					}
				}
			}
			if(p && p.activelink==true){
				self.activelink = true;
			}
			var tools = (toolslist)?'<div data-id="'+self.eid+'" class="tce_tools_c">'+toolslist+'</div>':'';
			var contedit = (p && p.disable==true)?'':' contenteditable="true"';
			var codedit = '<div style="display:none;" ondragenter="return false;" ondragleave="return false;" ondragover="return false;" ondrop="return false;" id="sc_code_editor_'+self.eid+'" class="sc_code_editor_c" contenteditable="true">'+self.htmlspecialchars(tahtml)+'</div>';
			$(p.targ).before('<div id="'+self.eid+'" class="tce_content_c">'+tools+'<div class="tce_content_x sc_editor_container"><div'+contedit+' class="tce_content">'+tahtml+'</div><div class="clear"></div>'+codedit+'</div></div>').hide();
			/* check */
			var pElement = document.createElement('p');
			var bodyText = $('#'+self.eid+' .tce_content').get(0);
			var firstLine = bodyText.firstChild;
			if(firstLine && firstLine.nodeName=='#text'){
				pElement.appendChild(firstLine);
				bodyText.prepend(pElement);
			}
			
			document.getElementById(self.eid).addEventListener("paste", function(e) {
				if($(e.target).parents('.tce_content').length){
					e.preventDefault();
					var text = e.clipboardData.getData("text/plain");
					var pastetxt = '';
					textarr = text.trim().split("\n");
					if(textarr.length){
						for(var i=0; i<textarr.length; i++){
							if(textarr[i].trim()){
								pastetxt += '<p>'+textarr[i].trim()+'</p>';
							}
						}
					}
					if(pastetxt){document.execCommand("insertHTML", false, pastetxt);}
				}else if($(e.target).hasClass('sc_code_editor_c') || $(e.target).parents('.sc_code_editor_c').length){
					var xid = $(e.target).parents('.tce_content_c').attr('id');
					self.pasteCodeFormat({e:e,id:xid});
				}
			});

			$('#sc_code_editor_'+self.eid).on('keydown', function(e){
				var xid = $(e.target).parents('.tce_content_c').attr('id');
				if($(e.target).hasClass('sc_code_editor_c')){
					if(e.keyCode==13){
						e.preventDefault();
						document.execCommand('insertHTML', false, '\n');
						e.stopPropagation();
						return false;
					}else if(e.keyCode==9){
						document.execCommand('insertHTML', false, '\t');
						return false;
					};
				}
			});
			$('#'+self.eid).on('keyup', function(e){
				var xid = $(e.target).parents('.tce_content_c').attr('id');
				self.keyUp({e:e,id:xid});
			});
			$('#'+self.eid).on('keydown', function(e){
				var xid = $(e.target).parents('.tce_content_c').attr('id');
				if(e.keyCode==13){
					if($(self.param[xid].cont) && $(self.param[xid].cont).get(0).tagName.toLowerCase()=='div'){
						$(self.param[xid].cont).after('<p id="tce-replacer"></p>');
						self.detectEl({id:'#'+xid+' #tce-replacer'});
						rng = document.createRange();
						rng.selectNodeContents(document.getElementById("tce-replacer"));
						rng.collapse(false);
						sel = window.getSelection();
						sel.removeAllRanges();
						sel.addRange( rng );  
						$('#'+xid+' #tce-replacer').removeAttr('id');
						e.stopPropagation();
						return false;
					};
				}
			});			

			$('#'+self.eid+' .tce_content').on('click','img,p,h1,h2,h3,h4,li,ul,ol,td,th,table,blockquote,a,b,strong,i,em,u,s,strike,span,div',function(e){
				e.stopPropagation();
				if(p.disable!=true){self.editElm({e:e,t:this}); };
			});

			$('#'+self.eid).on('mousedown','.tce_tools_btn',function(e){
				var xid = $(this).parents('.tce_content_c').attr('id');
				self.saveRange({id:xid});
			});

			$('#'+self.eid).on('click','.tce_tools_btn',function(e){
				var xid = $(this).parents('.tce_content_c').attr('id');
				if(xid && p.disable!=true){
					self.restoreRange({id:xid});
					e.stopPropagation();
					$(this).parent().find('.tce_tools_btn_active').removeClass('tce_tools_btn_active');
					var action = $(this).attr('data-action');
					var val = $(this).attr('data-val');
					if(action && self.tools[action].apply){
						self.tools[action].apply({val:val,id:xid,t:$(this)});
					}
					$(this).addClass('tce_tools_btn_active'); 
				}
			});
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
		paint:{
			button:function(p){return '<span class="tce_tools_btn_c tce_btn_paint_c"><span data-action="paint" data-val="foreColor" title="Цвет текста" class="tce_tools_btn tce_paint-tc"></span><span data-action="paint" data-val="backColor" title="Цвет выделения текста" class="tce_tools_btn tce_paint-tm"></span><span data-action="paint" data-val="link" title="Ссылка" class="tce_tools_btn tce_paint-link"></span></span>';},
			apply:function(p){
				var wgsel = window.getSelection();
				if(p.action=='addlink'){
					var src = $('#'+p.id+' .tce_tools_pop_c input[name=src]').val();
						if(src.length==0){
							$('#'+p.id+' .tce_tools_pop_c input[name=src]').addClass('error').focus(); return false; 
						}else{
							$('#'+p.id+' .tce_tools_pop_c input[name=src]').removeClass('error'); 
						}
					var text = $('#'+p.id+' .tce_tools_pop_c input[name=text]').val();
						if(text.length==0){
							$('#'+p.id+' .tce_tools_pop_c input[name=text]').addClass('error').focus(); return false; 
						}else{
							$('#'+p.id+' .tce_tools_pop_c input[name=text]').removeClass('error'); 
						}
					var title = $('#'+p.id+' .tce_tools_pop_c input[name=title]').val();
					var rel = $('#'+p.id+' .tce_tools_pop_c select[name=rel] option:selected').val();
					var blank = $('#'+p.id+' .sc_frame_form_xcheckbox').hasClass('checked');
					if(self.param[p.id].tagname=='a'){
						$(self.param[p.id].el).attr('href',src).text(text);
						if(title){$(self.param[p.id].el).attr('title',title); }
						if(blank){$(self.param[p.id].el).attr('target','_blank'); }
						if(rel){$(self.param[p.id].el).attr('rel',rel); }else{$(self.param[p.id].el).removeAttr('rel'); }
					}else{
						self.restoreRange({id:p.id});
						var blank = (blank)?' target="_blank"':'';
						var arel = (rel)?' rel="'+rel+'"':'';
						document.execCommand('insertHTML', false, '<a'+arel+blank+' href="'+src+'">'+text+'</a>');
					}
					self.closePop({id:p.id});
				}else{
					if(wgsel.rangeCount > 0 || p.tn=='a'){
						if(p.val=='backColor' || p.val=='foreColor'){
							if($(p.t).attr('data-color')){
								if($(p.t).attr('data-color')!='null'){
									document.execCommand(p.val,false,$(p.t).attr('data-color'));
								}else{
									document.execCommand("removeFormat", false, p.val);
								}
								$('#'+p.id+' .tce_tools_popbg_c, #'+p.id+' .tce_dp_tools_c').remove();
							}else{
								self.addDpTool({id:p.id,tool:'paint',val:p.val,pos:p.t.position(),width:'114px',height:'85px'});
							}
						}else if(p.val=='link'){
							var src = '';
							var text = (wgsel)?wgsel:'';
							var title = '';
							var blank = '';
							var opt = '';
							if(self.param[p.id].tagname=='a'){
								var src = $(self.param[p.id].el).attr('href');
								var text = $(self.param[p.id].el).text();
								var title = $(self.param[p.id].el).attr('title');
								var rel = $(self.param[p.id].el).attr('rel');
								title = (title)?title:'';
								var blank = ($(self.param[p.id].el).attr('target')=='_blank')?' checked':'';
							}
							var opt_arr = ['','nofollow','sponsored','ugc'];
							for(var i = 0; i < opt_arr.length; i++){
								var sel = (rel==opt_arr[i])?' selected':'';
								opt += '<option'+sel+' value="'+opt_arr[i]+'">'+opt_arr[i]+'</option>';
							}
							var ltext = self.param[p.id].range;
							var content = '<div class="tce_tools_pop_form_c">'+
							'<div class="tce_tools_pop_form_i"><label>Адрес ссылки</label><input value="'+src+'" placeholder="https://" name="src" type="text" /></div>'+
							'<div class="tce_tools_pop_form_i"><label>Текст ссылки</label><input value="'+text+'" name="text" value="'+ltext+'" type="text" /></div>'+
							'<div class="tce_tools_pop_form_i"><label>Заголовок</label><input value="'+title+'" name="title" type="text" /></div>'+
							'<div class="tce_tools_pop_form_i"><label>rel</label><select name="rel">'+opt+'</select></div>'+
							'<div class="tce_tools_pop_form_i"><label></label><span onclick="$(this).children().toggleClass(\'checked\');" class="sc_frame_form_xlable"><span name="blank" data-value="1" class="sc_frame_form_checkbox sc_frame_form_xcheckbox'+blank+'"></span> Открывать в новом окне</span></div>'+
							'</div>';
							var button = [{title:'OK',tools:'paint',action:'addlink',active:1}, {title:'Отмена',action:'close'}];
							self.addPop({id:p.id,title:'Ссылка',content:content,button:button});
						}
					}
				}
			},
			dptool:function(p){
				var colors = (p && p.val=='backColor')? ['#ffcdd2','#ffb74d','#ffd54f','#fff176','#aed581','#a5d6a7','#80cbc4','#81d4fa','#9fa8da','#b39ddb','#ce93d8','null'] : ['#f44336','#ff9800','#ffc107','#ffeb3b','#8bc34a','#4caf50','#009688','#03a9f4','#3f51b5','#673ab7','#9c27b0','null'];
				var res = '<span class="tce_tools_btn_c tce_btn_paint_c">';
				for(var i=0; i<colors.length; i++){
					res += '<span data-action="paint" data-val="'+p.val+'" data-color="'+colors[i]+'" style="background:'+colors[i]+';" class="tce_tools_btn"></span>';
				}
				res += '</span>';
				return res;
			},
			sel:function(p){
				var xid = p.id;
				if(p && xid && p.tn){
					var val = '';
					if(p.tn=='a'){
						$('#'+xid+' .tce_paint-link').addClass('tce_tools_btn_active');
					}
				}
			}
		},
		/*******/
		files:{
			button:function(p){return '<span class="tce_tools_btn_c tce_btn_file_c"><span data-action="files" title="Изображения" class="tce_tools_btn tce_img-add"></span><span data-action="files" data-val="file" title="Файлы" class="tce_tools_btn tce_file-add"></span></span>';},
			apply:function(p){var file = (p.val=='file')?'txt,pdf,doc,docx,xls,xlsx':false; scHp.filesOpen(p.id,file); },
			add:function(p){
				if(p.id && p.file==true){
					if(typeof self.param[p.id] != 'undefined' && typeof self.param[p.id].cont != 'undefined'){
						self.restoreRange({id:p.id});
						document.execCommand('insertHTML', false, p.list);
					}else{
						$('#'+p.id+' .tce_content').append('<p>'+p.list+'</p>');
					}
				}else if(p.id && p.imgs.length){
					var imglist = '';
					for(var i=0; i<p.imgs.length; i++){
						if(p.imgs[i]){
							if(p.zoom){
								var srca = p.imgs[i].split('/');
								srca[srca.length-1] = '.thumb_'+srca[srca.length-1];
								imgi = srca.join('/');
								imglist += '<img class="lifs_photo" src="' + imgi + '"/>';
							}else{
								imglist += (p.block)?'<p class="nui_images_container"><img src="'+p.imgs[i]+'"/></p>':'<img src="'+p.imgs[i]+'"/>';
							}
						}
					}
					if(p.zoom){imglist = '<p class="nui_images_container">'+imglist+'</p>'; }
					if(typeof self.param[p.id] != 'undefined'){
						if(self.param[p.id].cont){
							if(p.zoom || p.block){
								$(self.param[p.id].cont).after(imglist);
							}else{
								self.restoreRange({id:p.id});
								document.execCommand('insertHTML', false, imglist);
							}
						}else{
							$('#'+p.id+' .tce_content').append(imglist);
						}
					}else{
						$('#'+p.id+' .tce_content').append(imglist);
					}
				};
			},
			sel:function(p){
				$('#'+p.id+' .tce_img-add').addClass('tce_tools_btn_active');
				/* self.addMinipan({id:p.id},[{tool:'files',action:'apply',css:'tce_img-add'}]); */
			}
		},
		/*******/
		img:{
			sel:function(p){
				$('#'+p.id+' .sc_visual_active').removeClass('sc_visual_active');
				$(self.param[p.id].el).addClass('sc_visual_active');
				self.addMinipan({id:p.id},[
					{tool:'img',action:'nofloat',css:'tce_img-nofloat',title:'Без обтекания'},
					{tool:'img',action:'floatleft',css:'tce_img-floatleft',title:'Обтекание по левому краю'},
					{tool:'img',action:'floatright',css:'tce_img-floatright',title:'Обтекание по правому краю'},
					{tool:'img',action:'param',css:'tce_img-param'}
				]); 
			},
			nofloat:function(p){
				$(self.param[p.id].el).removeClass('lfs-fl-left lfs-fl-right').click();
			},
			floatleft:function(p){
				$(self.param[p.id].el).removeClass('lfs-fl-left lfs-fl-right').addClass('lfs-fl-left').click();
			},
			floatright:function(p){
				$(self.param[p.id].el).removeClass('lfs-fl-left lfs-fl-right').addClass('lfs-fl-right').click();
			},
			apply:function(p){
				var alt = $('#'+p.id+' .tce_tools_pop_c input[name=alt]').val();
				var all = $('#'+p.id+' .sc_frame_form_xcheckbox').hasClass('checked');
				if(alt){
					$(self.tmp).attr('alt',alt);
					if(all){	
						$('#'+p.id+' .tce_content img').attr('alt',alt);
					}
				};
				self.closePop({id:p.id});
			},
			param:function(p){
				self.tmp = self.param[p.id].el;
				var alt = $(self.param[p.id].el).attr('alt');
				alt = (alt)?alt:'';
				var content = '<div class="tce_tools_pop_form_c">'+
				'<div class="tce_tools_pop_form_i"><label>Alt</label><input value="'+alt+'" name="alt" type="text" /></div>'+
				'<div class="tce_tools_pop_form_i"><label></label><span onclick="$(this).children().toggleClass(\'checked\');" class="sc_frame_form_xlable"><span name="all" data-value="1" class="sc_frame_form_checkbox sc_frame_form_xcheckbox"></span> Применить ко всем на странице</span></div>'+
				'</div>';
				var button = [{title:'OK',tools:'img',action:'addalt',active:1}, {title:'Отмена',action:'close'}];
				self.addPop({id:p.id,title:'Свойства изображения',content:content,button:button});
			},
		},
		/*******/
		list:{
			button:function(p){return '<span class="tce_tools_btn_c tce_btn_list_c"><span data-action="list" title="Список" class="tce_tools_btn tce_list-ul"></span><span data-action="list" data-val="ol" title="Нумерованный список" class="tce_tools_btn tce_list-ol"></span></span>';},
			apply:function(p){
				self.restoreRange({id:p.id});
				var list = (p.val=='ol')?'insertorderedlist':'insertUnorderedList';
				document.execCommand(list);
			},
			sel:function(p){}
		},
		/*******/
		table:{
			button:function(p){return '<span class="tce_tools_btn_c tce_btn_table_c"><span data-action="table" title="Таблица" class="tce_tools_btn tce_table-i"></span></span>';},
			apply:function(p){
				self.addDpTool({id:p.id,tool:'table',val:p.val,pos:p.t.position(),width:'114px',height:'87px'});
			},
			seltd:function(p){
				$('#'+p.id+' .tce_tools_btn_c.tce_btn_paint_c table td.active').removeClass('active');
				for(var i=0; i<p.x; i++){
					for(var i2=0; i2<p.y; i2++){
						$('#'+p.id+' .tce_tools_btn_c.tce_btn_paint_c table tr:eq('+i+') td:eq('+i2+')').addClass('active');
					}
				}
			},
			add:function(p){
				self.closePop(p);
				var res = '<div class="sc_visual_table"><table>';
				for(var i=0; i<p.x; i++){
					var td = '';
					for(var i2=0; i2<p.y; i2++){
						td += '<td></td>';
					}
					res += '<tr>'+td+'</tr>';
				}
				res += '</table></div>';
				if(typeof self.param[p.id] != 'undefined' && typeof self.param[p.id].cont != 'undefined'){
					$(self.param[p.id].cont).after(res);
				}else{
					$('#'+p.id+' .tce_content').append(res);
				}
			},
			dptool:function(p){
				var res = '<div class="tce_tools_btn_c tce_btn_paint_c"><table>';
				for(var i=1; i<6; i++){
					var td = '';
					for(var i2=1; i2<8; i2++){
						td += '<td onClick="tsxEd.tools.table.add({t:this,id:\''+p.id+'\',x:'+i+',y:'+i2+'});" onmouseover="tsxEd.tools.table.seltd({t:this,id:\''+p.id+'\',x:'+i+',y:'+i2+'});" title="'+i2+'x'+i+'">&nbsp;</td>';
					}
					res += '<tr>'+td+'</tr>';
				}
				res += '</table></div>';
				return res;
			},
			addrow:function(p){
				if($(self.param[p.id].el).length){
					var tr = $(self.param[p.id].el).parents('tr:first');
					if(tr.length){
						var col = tr.find('td').length;
						var colx = 1;
						var td = '';
						tr.find('td').each(function(){
							var coln = $(this).attr('colspan');
							var cspan = (coln)?' colspan="'+coln+'"':'';
							td += '<td'+cspan+'></td>';
						});
						tr.after('<tr>'+td+'</tr>');
					}
				};
			},
			addcol:function(p){
				if($(self.param[p.id].el).length){
					var inx = $(self.param[p.id].el).index();
					/* $(self.param[p.id].cont).find('tr').append('<td></td>'); */
					$(self.param[p.id].cont).find('tr').each(function(){
						$(this).find('td:eq('+inx+')').after('<td></td>');
					});
				};
			},
			delrow:function(p){
				if($(self.param[p.id].el).length){
					$(self.param[p.id].el).parents('tr:first').remove();
				}
			},
			delcol:function(p){
				if($(self.param[p.id].el).length){
					var inx = $(self.param[p.id].el).index();
					$(self.param[p.id].cont).find('tr').each(function(){
						$(this).find('td:eq('+inx+')').remove();
					});
				}
			},
			joincol:function(p){
				if($(self.param[p.id].el).length){
					var nx = $(self.param[p.id].el).next();
					if(nx.length){
						var c1 = $(self.param[p.id].el).attr('colspan');
						var c2 = nx.attr('colspan');
						c1 = (c1)? parseInt(c1) : 1;
						c2 = (c2)? parseInt(c2) : 1;
						var col = c1+c2;
						$(self.param[p.id].el).attr({'colspan':col});
						nx.remove();
					}
				}				
			},
			splitcol:function(p){
				if($(self.param[p.id].el).length){
					var c1 = parseInt($(self.param[p.id].el).attr('colspan'));
					if(c1>0){
						var td = '';
						for(var i2=1; i2<c1; i2++){
							td += '<td></td>';
						}
						$(self.param[p.id].el).removeAttr('colspan').after(td);
					}
				}
			},
			sel:function(p){
				self.addMinipan({id:p.id},[
					{tool:'table',action:'addrow',css:'tce_table-addrow',title:'Добавить строку'},
					{tool:'table',action:'addcol',css:'tce_table-addcol',title:'Добавить столбец'},
					{tool:'table',action:'delrow',css:'tce_table-delrow',title:'Удалить строку'},
					{tool:'table',action:'delcol',css:'tce_table-delcol',title:'Удалить столбец'},
					{tool:'table',action:'joincol',css:'tce_table-joincol',title:'Объеденить ячейки'},
					{tool:'table',action:'splitcol',css:'tce_table-splitcol',title:'Разбить ячейки'},
				]); 
			}
		},
		line:{
			button:function(p){return '<span class="tce_tools_btn_c tce_btn_line_c"><span data-action="line" title="Линия" class="tce_tools_btn tce_tools_line"></span></span>';},
			apply:function(p){
				self.restoreRange({id:p.id});
				document.execCommand('insertHorizontalRule');
			},
			sel:function(p){}
		},
		object:{
			button:function(p){return '<span class="tce_tools_btn_c tce_btn_object_c"><span data-action="object" title="Объект" class="tce_tools_btn tce_object"></span></span>';},
			apply:function(p){
				if(p.action=='addCode'){
					var src = $('#'+p.id+' .tce_tools_pop_c textarea[name=code]').val();
					if(src.length>0){
						var res = '<div class="nui_iframe">'+src+'</div>';
						if(typeof self.param[p.id] != 'undefined' && typeof self.param[p.id].cont != 'undefined'){
							$(self.param[p.id].cont).after(res);
						}else{
							$('#'+p.id+' .tce_content').append(res);
						}
					}
					self.closePop(p);
				}else if(p.action=='saveCode'){
					var src = $('#'+p.id+' .tce_tools_pop_c textarea[name=code]').val();
					var del = $('#'+p.id+' .sc_frame_form_xcheckbox[name=del]').hasClass('checked');
					if(src){$(self.param[p.id].el).text(src); }
					if(del){			
						$(self.param[p.id].el).remove();
						self.param[p.id] = undefined;
					}
					self.closePop(p);
				}else{
					var content = '<div class="tce_tools_pop_form_c">'+
					'<div class="tce_tools_pop_form_i"><textarea placeholder="Вставьте код" name="code"></textarea></div>'+
					'</div>';
					var button = [{title:'OK',tools:'object',action:'addCode',active:1}, {title:'Отмена',action:'close'}];
					self.addPop({id:p.id,title:'Добавить объект или код',content:content,button:button});
				}
			},
			sel:function(p){
				var txt = $(self.param[p.id].el).text();
				var content = '<div class="tce_tools_pop_form_c">'+
				'<div class="tce_tools_pop_form_i"><textarea placeholder="Вставьте код" name="code">'+txt+'</textarea></div>'+
				'<div class="tce_tools_pop_form_i"><label></label><span onclick="$(this).children().toggleClass(\'checked\');" class="sc_frame_form_xlable"><span name="del" data-value="1" class="sc_frame_form_checkbox sc_frame_form_xcheckbox"></span> Удалить со страницы</span></div>'+
				'</div>';
				var button = [{title:'OK',tools:'object',action:'saveCode',active:1}, {title:'Отмена',action:'close'}];
				self.addPop({id:p.id,title:'Свойства объекта или код',content:content,button:button});				
			}
		},
		html:{
			button:function(p){return '<span class="tce_tools_btn_c tce_btn_html_c"><span data-action="html" data-val="show" title="Исходный код" class="tce_tools_btn tce_html-i"></span></span>';},
			apply:function(p){
				self.changeType({id:p.id});
			},
			sel:function(p){}
		},
		style:{
			button:function(p){return '<span class="tce_tools_btn_c tce_btn_style_c"><span data-action="style" data-val="show" title="Стили" class="tce_tools_btn tce_style-i"></span></span>';},
			apply:function(p){
				if(p.action=='addstyle'){
					if(self.param[p.id].cont){
						var sel = $('#'+p.id+' .tce_tools_pop_c select[name=cstyle] option:selected').val();
						var stylearr = [];
						for(var is3 in self.custom_style){if(self.custom_style[is3].v){stylearr.push(self.custom_style[is3].v); } }
						var newstyle = '';
						var csstyle = self.param[p.id].cont.attr('class');
						if(csstyle){
							var csstylearr = csstyle.split(' ');
							for(var i=0; i<csstylearr.length;i++){
								if(self.inArray(csstylearr[i],stylearr)){
									/* skip */
								}else{
									newstyle += csstylearr[i]+' ';
								}
							}
						}
						if(sel){newstyle += sel+' ';}
						self.param[p.id].cont.attr('class',newstyle.trim());
						self.closePop({id:p.id});
					}
				}else{
					self.closePop({id:p.id});
					if(self.param[p.id].cont){
						var option = '';
						var csstylearr = [];
						var csstyle = self.param[p.id].cont.attr('class');
						if(csstyle){csstylearr = csstyle.split(' '); };
						for(var is3 in self.custom_style){
							if(self.custom_style[is3].v){
								var selected = (self.inArray(self.custom_style[is3].v,csstylearr))?' selected':'';
								option += '<option'+selected+' value="'+self.custom_style[is3].v+'">'+self.custom_style[is3].n+'</option>'; 
							}
						}
						var content = '<div class="tce_tools_pop_form_c">'+
							'<div class="tce_tools_pop_form_i"><label>Название стиля</label><select name="cstyle"><option value="">Без стиля</option>'+option+'</select></div>'+
						'</div>';
						var button = [{title:'OK',tools:'style',action:'addstyle',active:1}, {title:'Отмена',action:'close'}];
						self.addPop({id:p.id,title:'Дополнительный стиль',content:content,button:button});
					}
				};
			},
			sel:function(p){}
		},
		/*******/
		movie:{
			button:function(p){return '<span class="tce_tools_btn_c tce_btn_movie_c"><span data-action="movie" title="Опустить вниз" class="tce_tools_btn tce_movie-down"></span><span data-action="movie" title="Поднять вверх" data-val="up" class="tce_tools_btn tce_movie-up"></span></span>';},
			apply:function(p){
				self.closePop({id:p.id});
				if($(self.param[p.id].cont).length){
					if(self.param[p.id].conttagname=='table'){
						var elTd = $(self.param[p.id].cont).parents('.sc_visual_table:first');
						var el = (elTd.length)? elTd : $(self.param[p.id].cont);
					}else{
						var el = $(self.param[p.id].cont);
					}
					var t = (p.val)?p.val:'down';
					if(t=='up'){
						var prv = el.prev();
						if(prv.length){
							el.insertBefore(prv);
						}
					}else if(t=='down'){
						var nxt = el.next();
						if(nxt.length){
							el.insertAfter(nxt);
						}	
					}
				}
			},
			sel:function(p){}
		},
		/*******/
		del:{
			button:function(p){return '<span class="tce_tools_btn_c tce_btn_del_c"><span data-action="del" title="Удалить" class="tce_tools_btn tce_del"></span></span>';},
			apply:function(p){
				var el = self.param[p.id].el;
				var tag = self.param[p.id].tagname;
				if(tag=='p' || tag=='h1' || tag=='h2' || tag=='h3' || tag=='h4' || tag=='blockquote' || tag=='hr' || tag=='obj' || tag=='stick'){
					$(el).remove();
				}else if(tag=='li'){
					$(el).parent().remove();
				}else if(tag=='td' || tag=='th'){
					el.parents('.sc_visual_table:first').remove();
					el.parents('table:first').remove();
				}else if(tag=='b' || tag=='strong' || tag=='i' || tag=='em' || tag=='u' || (tag=='span' && ($(el).css('text-decoration')=='line-through' || $(el).css('text-decoration')=='underline'))){
					$(el).contents().unwrap();
				}else if(tag=='img'){
					var pelm = el.parents('.nui_images_container:first');
					$(el).remove();
					if(pelm.find('img').length==0){
						pelm.remove();
					}
				}
				self.closePop({id:p.id});
				self.param[p.id] = undefined;
			},
			sel:function(p){}
		},
		blank:{
			button:function(p){},
			apply:function(p){},
			sel:function(p){}
		}
	};
	
	this.changeType = function(p){
		if(p.id){
			var id = p.id;
			if($('#sc_code_editor_'+id).length && $('#sc_code_editor_'+id).css('display')=='block'){
				var code = $('#sc_code_editor_'+id).text();
				if(code){code = self.clearCode(code);}
				$('#'+id+' .tce_content').html(code).show();
				$('#sc_code_editor_'+id).hide();
				$('#'+id+' .tce_tools_c').removeClass('sc_html_mode');
			}else{
				self.closePop({id:p.id});
				var text = $('#'+id+' .tce_content').html();
				text = self.formatCode(self.clearCode(text));
				$('#sc_code_editor_'+id).text(text).show().focus();
				$('#'+id+' .tce_content').hide();
				$('#'+id+' .tce_tools_c').addClass('sc_html_mode');
			};
		};
	}
	
	this.clearCode = function(t){
		if(t){
			t = t.replace(/<p><br><\/p>/gi, '').replace(/<p>\n<br><\/p>/gi, '').replace(/<p><\/p>/gi, '');
		}
		return t;
	}
	
	this.formatCode = function(t){
		if(t){
			t = t.replace(/<(p|h1|h2|h3|h4|br|ul|ol|table|tbody|blockquote|div|tr|td|li)(.*?)>/gi, '\n<$1$2>')
			.replace(/<(tr|td|li)(.*?)>/gi, '\n\t<$1$2>')
			.replace(/<\/(table|tbody|tr|div|ul|ol)>/gi, '</$1>\n');
			t = t.replace(/(\n){1,}/g,'\n').replace(/(\n\t){1,}/g,'\n\t').trim();
		}
		return t;
	}
	
	this.codeColor = function(t){
		t = t.replace(/&lt;(h1|h2|h3|h4|h5|a|textarea|b|strong|i|em|div|span|p|img|ul|ol|li|b|i|blockquote|br)((?:\s{1}[a-zA-Z]+\=\"[^\"]*\"{1}\s*)*)&gt;{1}/gi, '<i class="sc_tag">&lt;$1<i class="sc_tag_attr">$2</i>&gt;</i>')
		.replace(/&lt;\/(h1|h2|h3|h4|h5|a|textarea|b|strong|i|em|div|span|p|img|ul|ol|li|b|i|blockquote)&gt;{1}/gi, '<i class="sc_tag">&lt;/$1&gt;</i>');
		return t;
	}
	
	this.formatTag = function(c){	
		window.document.execCommand(c, false, null);
		return false;
	}
	
	this.saveArea = function(p){
		if(p && p.id){
			self.closePop({id:p.id});
			var cod = false;
			if($('#sc_code_editor_'+p.id).length && $('#sc_code_editor_'+p.id).css('display')=='block'){
				cod = true;
				var tar = $('#sc_code_editor_'+p.id);
			}else{
				var tar = $('#'+p.id+' .tce_content');
			}
			if(tar.length){
				var cont = (cod)? tar.text() : tar.html();
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
	
	this.addMinipan = function(p,b){
		$('#'+p.id+' .tce_content sub').remove();
		var pos = $(self.param[p.id].el).position();
		var e_b = '';
		for(var i2 in b){
			if(self.tools[b[i2].tool][b[i2].action]){
				var title = (b[i2].title)? ' title="'+b[i2].title+'"' : '';
				e_b += '<span'+title+' onClick="tsxEd.tools[\''+b[i2].tool+'\'][\''+b[i2].action+'\']({id:\''+p.id+'\',t:$(this)});" class="tce_tools_btn '+b[i2].css+'"></span>';
			}
		}
		var tops = pos.top-30;
		tops = (tops < 1)? 1 : tops;
		$('#'+p.id+' .tce_content').append('<sub alt="'+p.id+'" contenteditable="false" style="top:'+tops+'px; left:'+(pos.left+5)+'px" id="sc_visual_minipan_'+p.id+'" class="sc_visual_minipan">'+e_b+'</sub>');
		$('#sc_visual_minipan_'+p.id).fadeIn(300);
	}
	
	this.inArray = function(value, array){
		for(var i = 0; i < array.length; i++){
			if(array[i] == value) return true;
		}
		return false;
	}
	
	this.addDpTool = function(p){
		if(p && p.id && p.tool){
			$('#'+p.id+' .tce_dp_tools_c').remove();
			var tool = (self.tools[p.tool].dptool)?self.tools[p.tool].dptool({val:p.val,id:p.id}):'';
			var style="";
			if(p.width){style+="width:"+p.width+";";}
			if(p.height){style+="height:"+p.height+";";}
			if(p.pos && p.pos.left){style+="left:"+p.pos.left+"px;";}
			$('#'+p.id+'').append('<div onClick="tsxEd.closePop({t:this,id:\''+p.id+'\'})" class="tce_tools_popbg_c"></div><div style="'+style+'" class="tce_dp_tools_c">'+tool+'</div>');
		}
	}
	
	this.addPop = function(p){
		if(p && p.id){
			$('#'+p.id+' .tce_tools_pop_c, #'+p.id+' .tce_tools_popbg_c').remove();
			var style="";
			if(p.width){style+="width:"+p.width+";";}
			if(p.height){style+="height:"+p.height+";";}
			var title = (p && p.title)? '<div class="tce_tools_pop_t">'+p.title+'</div>' : '';
			var cont = (p && p.content)? '<div class="tce_tools_pop">'+p.content+'</div>' : '';
			var button = '';
			if(p && p.button){
				button += '<div class="tce_tools_pop_btn_c">';
				for(var i in p.button){
					if(p.button[i].title){
						var act = (p.button[i].active)?' active':'';
						var click = '';
						if(p.button[i].action=='close'){
							click = 'tsxEd.closePop({t:this,id:\''+p.id+'\'});';
						}else if(p.button[i].action && p.button[i].tools){
							click = 'tsxEd.tools[\''+p.button[i].tools+'\'].apply({id:\''+p.id+'\',action:\''+p.button[i].action+'\'});';
						}
						button += '<span onClick="'+click+'" class="tce_tools_pop_btn'+act+'">'+p.button[i].title+'</span>';
					}
				}
				button += '</div>';
			}
			$('#'+p.id+'').append('<div class="tce_tools_popbg_c"></div><div style="'+style+'" class="tce_tools_pop_c"><span onClick="tsxEd.closePop({t:this,id:\''+p.id+'\'});" class="tce_tools_pop_close"></span>'+title+'<div class="tce_tools_pop">'+cont+'</div>'+button+'</div>');
		}
	}
	
	this.closePop = function(p){
		$('#'+p.id+' .tce_tools_popbg_c, #'+p.id+' .tce_tools_pop_c, #'+p.id+' .tce_dp_tools_c, #'+p.id+' .sc_visual_minipan').remove();
		$('#'+p.id+' .tce_tools_select_activate').removeClass('tce_tools_select_activate');
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
			$('#'+xid+' .sc_visual_active').removeClass('sc_visual_active');
			$('#'+xid+' .tce_content sub').remove();
			$('#'+xid+' .tce_tools_btn.tce_tools_btn_active').removeClass('tce_tools_btn_active');
			if(self.param[xid].conttagname=='h1' || self.param[xid].conttagname=='h2' || self.param[xid].conttagname=='h3' || self.param[xid].conttagname=='h4' || self.param[xid].conttagname=='p' || self.param[xid].conttagname=='blockquote'){
				self.tools['format'].sel({tn:self.param[xid].conttagname,id:xid});
				self.tools['font'].sel({tn:self.param[xid].conttagname,id:xid});
				self.tools['fontsize'].sel({tn:self.param[xid].conttagname,etn:self.param[xid].tagname,id:xid});
				self.tools['align'].sel({tn:self.param[xid].conttagname,id:xid});
				if($(self.param[xid].el).hasClass('nui_images_container')){
					$(self.param[xid].el).addClass('sc_visual_active');
				}
			}
			if(self.param[xid].tagname=='b' || self.param[xid].tagname=='strong' || self.param[xid].tagname=='i' || self.param[xid].tagname=='em' || self.param[xid].tagname=='u' || self.param[xid].tagname=='s' || self.param[xid].tagname=='strike' || self.param[xid].tagname=='span'){
				self.tools['mark'].sel({tn:self.param[xid].tagname,id:xid});
			}else if(self.param[xid].tagname=='a'){
				if(self.activelink==true){
					var href = $(self.param[xid].el).attr('href');
					if(href){window.open(href); };
				};
				self.tools['paint'].sel({tn:self.param[xid].tagname,id:xid});
			}else if(self.param[xid].tagname=='img'){
				self.tools['img'].sel({tn:self.param[xid].tagname,id:xid});
			}else if(self.param[xid].tagname=='td' || self.param[xid].tagname=='th'){
				$(self.param[xid].el).addClass('sc_visual_active');
				self.tools['table'].sel({tn:self.param[xid].tagname,id:xid});
			}else if(self.param[xid].tagname=='div'){
				if($(self.param[xid].el).hasClass('nui_iframe')){
					$(self.param[xid].el).addClass('sc_visual_active');
					self.tools['object'].sel({tn:self.param[xid].tagname,id:xid});
				}
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
				if(tagName == 'td' || tagName == 'th'){
					var contx = el.parents('table:first');
					if(contx.length){
						cont = contx;
						contTagName = 'table';
					}					
				}else if(tagName != 'p' || tagName != 'ul' || tagName != 'ol'){
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
	
	this.showOption = function(p){
		if(p && p.t){
			$(p.t).addClass('tce_tools_select_activate');
			$('#'+p.id+'').append('<div onClick="tsxEd.closePop({t:this,id:\''+p.id+'\'})" class="tce_tools_popbg_c"></div>');
		}
	}
	
	this.getOption = function(p){
		var a = '';
		if(p && p.options && p.name){
			a += '<span onClick="tsxEd.showOption({t:this,id:\''+p.id+'\'});" class="tce_tools_select_c tce_tools_select_'+p.name+'"><span class="tce_tools_select">';
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
				setTimeout(function(){$(t).parents('.tce_tools_select_activate').removeClass('tce_tools_select_activate'); self.closePop({id:id}); },0.1);
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
	
	this.pasteCodeFormat = function(p){
		if(p.id){
			setTimeout( function(){
				$('#sc_code_editor_'+p.id+'').text($('#sc_code_editor_'+p.id+'').text());
			}, .001);
		}
	}
	
	this.stripTags = function(input, allowed) {
		allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
		var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
			commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
		return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
			return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
		});
	}
	
	this.uid = function(){
		return '_' + Math.random().toString(36).substr(2, 9);
	}
	
	this.saveRange = function(p){
		if(p && p.id){
			if(typeof self.param[p.id]=='undefined'){self.param[p.id] = {}; }
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
				}else if (document.selection) {
					range.select();
				}
			}
		}
	}
	
	this.htmlspecialchars = function(str) {
		if (typeof(str) == "string") {
			str = str.replace(/&/g, "&amp;");
			str = str.replace(/"/g, "&quot;");
			str = str.replace(/'/g, "&#039;");
			str = str.replace(/</g, "&lt;");
			str = str.replace(/>/g, "&gt;");
		}
		return str;
	}
	
}
var tsxEd = new tsxEdClass();