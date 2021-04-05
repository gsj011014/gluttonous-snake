/**
 * jquery plugin -- jquery.GluttonousSnakeGame.js
 * Description: a slideunlock plugin based on jQuery
 * Version: 1.1
 * Author: Gu Shijie
 * created: February 29, 2020 01:09
 */

;
(function($, window, document, undefined) {
	
	var single_ele_width = 20; //单个元素的宽度
	var single_ele_height = 20; //单个元素的高度
	var map_row_count = $('#game-map').height() / single_ele_height; //地图的行数
	var map_col_count = $('#game-map').width() / single_ele_width; //地图的列数
	var snake = null; //蛇的实例
	var food = null; //食物的实例
	var game = null; //游戏规则的实例
	
	/**
	 * 贪吃蛇实例 
	 */
	function GluttonousSnakeGame(){

	}
	
	/**
	 * 贪吃蛇初始化
	 */
	GluttonousSnakeGame.prototype.init = function(){
		
		snake = new StructureSnake(); //蛇的实例
		food = new Food(); //食物的实例
		game = new Game();
		snake.create_snake(); //创造蛇
		food.create_food(); //创造食物
		game.init(); //游戏的初始化
		game.start_game(); //开始游戏
	}
	
	/**
	 * 构造元素实例
	 * @param {x,y,classname} x轴坐标 y轴坐标 class 
	 */
	function StructureElement(x,y,classname){
		this.x = x;
		this.y = y;
		this.classname = classname;
		this.snake_parent = $('#game-map');
	}
	
	/**
	 * 创建元素
	 */
	StructureElement.prototype.create_element = function(){
		this.snake_parent.append('<span class="'+this.classname+'"></span>');
		this.this_element = this.snake_parent.find('span').last();
		this.this_element.css({
			"position":"absolute",
			"left":this.x * single_ele_width + "px",
			"top":this.y * single_ele_height + "px"
		});
	}
	
	/**
	 * 删除创指定的元素
	 */
	StructureElement.prototype.delete_element = function(){
		this.this_element.remove();
	}
	
	/**
	 * 构造蛇 蛇的信息
	 */
	function StructureSnake(){
		this.snake_head = null; //存储蛇头的信息
		this.snake_tail = null; //存储蛇尾的信息
		this.snake_pos = [ //存储蛇身上的坐标
			
		];
		this.snake_head_direction_num = { //蛇头的方向
			up: {
				x:0,
				y:-1,
				rotate:-180,
				margin:"4px 0px 0px 3px"
			},
			right: {
				x:1,
				y:0,
				rotate:-90,
				margin:" 3px 0px 0px 0px "
			},
			down: {
				x:0,
				y:1,
				rotate:0,
				margin:"0px 0px 0px 3px"
			},
			left: {
				x:-1,
				y:0,
				rotate:90,
				margin:"3px 0px 0px 4px"
			}
			
		};
		//蛇头默认方向朝右
		this.snake_head_direction = this.snake_head_direction_num.right;
	}
	
	/**
	 * 创建蛇 然后让蛇头蛇尾形成链表关系
	 */
	StructureSnake.prototype.create_snake = function(){
		//蛇头
		var snake_head = new StructureElement(2,0,'snake-head');
			snake_head.create_element();
			snake_head.this_element.css('transform','rotate('+this.snake_head_direction.rotate+'deg)');
			this.snake_head = snake_head; //更新蛇头信息
			this.snake_pos.push([snake_head.x,snake_head.y]); //更新蛇身上坐标信息
		//蛇身体
		var snake_body = new StructureElement(1,0,'snake-body');
			snake_body.create_element();
			this.snake_pos.push([snake_body.x,snake_body.y]); //更新蛇身上坐标信息
		//蛇尾
		var snake_tail = new StructureElement(0,0,'snake-body');
			snake_tail.create_element();
			this.snake_tail = snake_tail;
			this.snake_pos.push([snake_tail.x,snake_tail.y]);
			
			//更新链表关系
			snake_head.last = null;
			snake_head.next = snake_body;
			
			snake_body.last = snake_head;
			snake_body.next = snake_tail;
			
			snake_tail.last = snake_body;
			snake_tail.next = null;
			$('.snake-body').css('margin',this.snake_head_direction.margin);
	}
	
	/**
	 * 根据蛇下一步要走的位置 判断下一个位置是什么
	 */
	StructureSnake.prototype.get_next_pos = function(){
		var get_next_pos = [
			this.snake_head.x + this.snake_head_direction.x,
			this.snake_head.y + this.snake_head_direction.y
		];
		
		/**
		 * 判断下一个位置会是什么？
		 */
		//撞到自己
		var oneself = false;
		$.each(this.snake_pos,function(){
			if(this[0] == get_next_pos[0] && this[1] == get_next_pos[1]){
				oneself = true;
			}
		});
			
		if(oneself){
			console.log('撞到自己');
			return;
		}
		
		//撞到墙
		if(get_next_pos[0] < 0 || get_next_pos[0] > map_col_count - 1 || get_next_pos[1] < 0 || get_next_pos[1] > map_row_count - 1){
			console.log('撞到墙');
			return;
		}
		
		//吃掉食物
		if(get_next_pos[0] == food.food_pos[0] && get_next_pos[1] == food.food_pos[1]){
			this.tactics.eat.call(this,true);
			return;
		}
		
		//什么也没有
		this.tactics.move.call(this,true);
	}
	
	/**
	 * 根据下一个位置，做对应的事情！
	 */
	StructureSnake.prototype.tactics = {
		move: function(format){ //继续移动
			//创建新的身体 => 删头去尾
			var new_body = new StructureElement(this.snake_head.x,this.snake_head.y,'snake-body');
				new_body.create_element();
				new_body.next = this.snake_head.next; //更新链表关系
				new_body.next.last = new_body;
				new_body.last = null;
				this.snake_head.delete_element(); //删除头
				
			var new_snake_head = new StructureElement(this.snake_head.x + this.snake_head_direction.x,this.snake_head.y + this.snake_head_direction.y,'snake-head');
				new_snake_head.create_element();
				new_snake_head.this_element.css('transform','rotate('+this.snake_head_direction.rotate+'deg)'); //更新蛇头的朝向
				this.snake_pos.unshift([new_snake_head.x,new_snake_head.y]); //更新蛇身上的信息
				this.snake_head = new_snake_head; //更新蛇头
				new_snake_head.last = null; //更新链表关系
				new_snake_head.next = new_body;
				new_body.last = new_snake_head;
				
				//是否删除蛇尾
				if(format){
					this.snake_tail.delete_element(); //执行删除操作
					this.snake_pos.pop(); //删除蛇尾的位置信息    pop()=>删除数组最后一个元素   shift()=>删除数组第一个元素  push()=>在数组最后一个位置添加一个元素 unshift()=>在数组第一个位置添加一个元素
					this.snake_tail = this.snake_tail.last; //更新蛇尾
				}
			$('.snake-body').css('margin',this.snake_head_direction.margin);
				
		},
		eat: function(){ //吃食物
			this.tactics.move.call(this,false);
			food.create_food(); //创造食物 吃完一次创建一次
		},
		die: function(){ //死亡
			console.log('死亡！');
		}
	}
		
	/**
	 * 食物的实例
	 */
	function Food(){
		this.food_pos = [
			
		];
	
	/**
	 * 创造食物
	 */
	Food.prototype.create_food = function(){
		var x = null,
			y = null,
			exist = true; //是否存在
			while(exist){
				x = Math.round(Math.random() * (map_col_count - 1));
				y = Math.round(Math.random() * (map_row_count - 1));
				$.each(snake.snake_pos,function(){ //防止食物生产在蛇的身上
					if(this[0] != x && this[1] != y){
						exist = false;
					}
				});
			}
			if(snake.snake_head.snake_parent.find('.snake-food').length <= 0){ //代表没有食物 没有食物就创造食物
				var food = new StructureElement(x,y,'snake-food');
					food.create_element();
					this.food_pos = [x,y];
			}else{//有食物只需要变换位置
				snake.snake_head.snake_parent.find('.snake-food').css({
					"position":"absolute",
					"left": x * single_ele_width + "px",
					"top": y * single_ele_height + "px"
				});
				this.food_pos = [x,y];
			}
		
	}
}
	/**
	 * 游戏实例
	 */
	function Game(){
		this.timer = null;
	}
	
	/**
	 * 游戏初始化
	 */
	Game.prototype.init = function(){
		document.onkeydown = function(event){
			if(event.which == 37 && snake.snake_head_direction != snake.snake_head_direction_num.right){//向左
				snake.snake_head_direction = snake.snake_head_direction_num.left;
			}else if(event.which == 38 && snake.snake_head_direction != snake.snake_head_direction_num.down){//向上
				snake.snake_head_direction = snake.snake_head_direction_num.up;
			}else if(event.which == 39 && snake.snake_head_direction != snake.snake_head_direction_num.left){//向右
				snake.snake_head_direction = snake.snake_head_direction_num.right;
			}else if(event.which == 40 && snake.snake_head_direction != snake.snake_head_direction_num.up){//向下
				snake.snake_head_direction = snake.snake_head_direction_num.down;
			}
		}
	}
	
	/**
	 * 开始游戏
	 */
	Game.prototype.start_game = function(){
		this.timer = setInterval(function(){
			snake.get_next_pos(); //获取蛇下一步移动的坐标
		},200);
	}
	
	window.GluttonousSnakeGame = GluttonousSnakeGame;
	GluttonousSnakeGame.create = function(){
		return new GluttonousSnakeGame();
	}
	
})(jQuery, window, document);

GluttonousSnakeGame.create().init();