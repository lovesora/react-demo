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
    //react属性是不可变
    class CompProps extends React.Component {
        render() {
            return <span>{this.props.name}</span>;
        }
    }


    //react状态
    //react状态可变
    class CompState extends React.Component {
        //es6剩余参数
        constructor(...args) {
            //需要记得super()
            super(...args);
            this.state = {
                input: "please input value"
            };
        }

        //这里的event不是原生的event！
        onChange(event) {
            //设置状态改变
            this.setState({
                input: event.target.value
            });
        }

        //记得使用bind传递上下文
        render() {
            return <div>
                <input type="text" onChange={this.onChange.bind(this)} />
                <p id="pInputValue">{this.state.input}</p>
            </div>
        }
    }


    //complete component
    class CompComp extends React.Component {
        constructor(...args) {
            super(...args);
            this.state = {
                display: "block"
            };
        }

        onClickButton() {
            this.setState({
                display: this.state.display == "block" ? "none" : "block"
            })
        }

        render() {
            return <div>
                    <input type="button" value="show&hide" onClick={this.onClickButton.bind(this)}/>
                    <div className="show-hide" style={{display:this.state.display}}></div>
                </div>
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

        ReactDOM.render(
            <CompState />,
            document.getElementById('comp-status')
        );

        ReactDOM.render(
            <CompComp />,
            document.getElementById('complete-comp')
        );
    }
})();