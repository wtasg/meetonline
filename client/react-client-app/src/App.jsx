import "./App.css";
import { Menu } from "./features/Menu";
import { Top } from "./features/Top";

function App() {

    return (
        <div className="flex">
            <Menu />
            <div>
                <Top />
            </div>
        </div>
    );
}

export default App;
