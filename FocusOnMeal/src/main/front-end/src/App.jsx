import {BrowserRouter, Routes, Route} from 'react-router-dom';
import IngredientLayout from './components/IngredientLayout';
import IngredientSearch from './pages/ingredient/list';

function App() {

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/ingredient" element={<IngredientLayout/>}>
            <Route path="list" element={<IngredientSearch/>}/>
            <Route index element={<IngredientSearch/>}/>
          </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
