(function() {
	if ("index" != configs.globalFileName)
		return;

	//es6类
	class Div {
		constructor() {
			this.name = "div";
		}

		getName() {
			return this.name;
		}
	}
	var cDiv = new Div();
	//jsx语法
	var div = <div>{cDiv.getName()}</div>;


	//react组件
	class Comp extends React.Component {
		//必须给render方法
		render() {
			return <span>react Component render</span>;
		}
	}


	//react组件属性
	class CompProps extends React.Component {
		render() {
			return <span>{this.props.name}</span>;
		}
	}

	window.onload = function() {
		//react虚拟dom渲染到真实dom
		ReactDOM.render(
			div, //什么东西
			document.getElementById("div") //渲染到哪里
		);

		ReactDOM.render(
			<Comp />,
			document.getElementById("comp")
		);

		ReactDOM.render(
			<CompProps name="CompProps" />,
			document.getElementById('comp-props')
		);
	}
})();