(function() {
    if ("lifecycle" != configs.globalFileName)
        return;

    //clock
    class ClockComp extends React.Component {
        constructor(...args) {
            super(...args);
            this.state = {
                h: 0,
                m: 0,
                s: 0
            };

            setInterval(() => {
                this.updateClock();
            }, 1000);
        }

        componentWillMount() {
            console.log("componentWillMount");
        }

        componentDidMount() {
            console.log("componentDidMount");
            this.updateClock();
        }

        componentWillUpdate(nextProps, nextState) {
            console.log("componentWillUpdate");
        }

        componentDidUpdate(prevProps, prevState) {
            console.log("componentDidUpdate");
        }

        componentWillUnmount() {
            console.log("componentWillUnmount");
        }

        updateClock() {
            let date = new Date();
            this.setState({
                h: date.getHours(),
                m: date.getMinutes(),
                s: date.getSeconds()
            });
        }

        render() {
            return <div>{this.state.h}:{this.state.m}:{this.state.s}</div>
        }
    }

    class Item extends React.Component {
        constructor(...args) {
            super(...args);
        }

        componentWillReceiveProps(nextProps) {
            console.log("componentWillReceiveProps:" + JSON.stringify(nextProps));
        }

        render() {
            return <li>{this.props.value}</li>;
        }
    };

    class List extends React.Component {
        constructor(...args) {
            super(...args);

            this.state = {
                receiveProps: 1,
                values: [10, 11, 12, 13]
            };
        }

        componentDidMount() {
            this.setState({
                items: this.state.values.map((v, k) => <Item key={k} value={v} />)
            })
        }

        addItem() {
            this.setState({
                items: this.state.items.concat([<Item key={this.state.items.length} value={Math.random()}/>])
            });
        }

        changeItem() {
            this.setState({
                receiveProps: this.state.receiveProps + 1
            });
        }

        render() {
            return <div>
                <input type="button" value="Add Item" onClick={this.addItem.bind(this)}/>
                <input type="button" value="Change Item" onClick={this.changeItem.bind(this)}/>
                <ul><Item value={this.state.receiveProps}/></ul>
                <hr/>
                <ul>{this.state.items}</ul>
            </div>;
        }
    };


    window.onload = function() {
        var i = 0;

        //componentWillUnmount
        document.getElementById('clock-comp').onclick = () => {
            if (i++ % 2) {
                ReactDOM.render(
                    <ClockComp />,
                    document.getElementById('clock-comp')
                );
            } else {
                ReactDOM.render(
                    <div>div</div>,
                    document.getElementById('clock-comp')
                );
            }
        };

        ReactDOM.render(
            <ClockComp />,
            document.getElementById('clock-comp')
        );

        ReactDOM.render(
            <List />,
            document.getElementById('receive-props-comp')
        );
    }

})();