import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PowerAppLayout from './shared/layouts/PowerAppLayout';
import ItemsAppLayout from './apps/items/components/ItemsAppLayout';
import WeightAppLayout from './apps/weight/components/WeightAppLayout';
import FCDAppLayout from './apps/fcd/components/FCDAppLayout';
import Home from './pages/Home';

// Items App Pages
import ItemsDashboard from './apps/items/pages/Dashboard';
import ItemsList from './apps/items/pages/ItemsList';
import ItemDetails from './apps/items/pages/ItemDetails';
import AddItem from './apps/items/pages/AddItem';
import EditItem from './apps/items/pages/EditItem';

// Weight App Pages
import WeightDashboard from './apps/weight/pages/WeightDashboard';

// FCD App Pages
import FCDDashboard from './apps/fcd/pages/FCDDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Power App Home */}
        <Route path="/" element={
          <PowerAppLayout>
            <Home />
          </PowerAppLayout>
        } />

        {/* Items App Routes */}
        <Route path="/items-app/*" element={
          <ItemsAppLayout>
            <Routes>
              <Route path="/" element={<ItemsDashboard />} />
              <Route path="/list" element={<ItemsList />} />
              <Route path="/new" element={<AddItem />} />
              <Route path="/:id" element={<ItemDetails />} />
              <Route path="/:id/edit" element={<EditItem />} />
            </Routes>
          </ItemsAppLayout>
        } />

        {/* Items App Routes (alternative path) */}
        <Route path="/items/*" element={
          <ItemsAppLayout>
            <Routes>
              <Route path="/" element={<ItemsDashboard />} />
              <Route path="/list" element={<ItemsList />} />
              <Route path="/new" element={<AddItem />} />
              <Route path="/:id" element={<ItemDetails />} />
              <Route path="/:id/edit" element={<EditItem />} />
            </Routes>
          </ItemsAppLayout>
        } />

        {/* Weight App Routes */}
        <Route path="/weight-app/*" element={
          <WeightAppLayout>
            <Routes>
              <Route path="/" element={<WeightDashboard />} />
            </Routes>
          </WeightAppLayout>
        } />

        {/* FCD App Routes */}
        <Route path="/fcd-app/*" element={
          <FCDAppLayout>
            <Routes>
              <Route path="/" element={<FCDDashboard />} />
            </Routes>
          </FCDAppLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
