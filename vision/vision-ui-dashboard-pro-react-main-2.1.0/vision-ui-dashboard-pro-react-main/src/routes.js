/** 

=========================================================
* Vision UI PRO React - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-dashboard-pro-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com/)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Visionware.

*/

/** 
  All of the routes for the Vision UI Dashboard PRO React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Vision UI Dashboard PRO React layouts
import Default from 'layouts/dashboards/default';
import CRM from 'layouts/dashboards/crm';
import ProfileOverview from 'layouts/pages/profile/profile-overview';
import Teams from 'layouts/pages/profile/teams';
import AllProjects from 'layouts/pages/profile/all-projects';
import Reports from 'layouts/pages/users/reports';
import NewUser from 'layouts/pages/users/new-user';
import Settings from 'layouts/pages/account/settings';
import Billing from 'layouts/pages/account/billing';
import Invoice from 'layouts/pages/account/invoice';
import General from 'layouts/pages/projects/general';
import Timeline from 'layouts/pages/projects/timeline';
import Widgets from 'layouts/pages/widgets';
import Charts from 'layouts/pages/charts';
import Alerts from 'layouts/pages/alerts';
import PricingPage from 'layouts/pages/pricing-page';
import RTL from 'layouts/pages/rtl';
import Kanban from 'layouts/applications/kanban';
import Wizard from 'layouts/applications/wizard';
import DataTables from 'layouts/applications/data-tables';
import Calendar from 'layouts/applications/calendar';
import NewProduct from 'layouts/ecommerce/products/new-product';
import EditProduct from 'layouts/ecommerce/products/edit-product';
import ProductPage from 'layouts/ecommerce/products/product-page';
import OrderList from 'layouts/ecommerce/orders/order-list';
import OrderDetails from 'layouts/ecommerce/orders/order-details';
import SignInBasic from 'layouts/authentication/sign-in/basic';
import SignInCover from 'layouts/authentication/sign-in/cover';
import SignInIllustration from 'layouts/authentication/sign-in/illustration';
import SignUpBasic from 'layouts/authentication/sign-up/basic';
import SignUpCover from 'layouts/authentication/sign-up/cover';
import SignUpIllustration from 'layouts/authentication/sign-up/illustration';

// React icons
import { IoDocument } from 'react-icons/io5';
import { IoBuild } from 'react-icons/io5';
import { IoDocuments } from 'react-icons/io5';
import { FaShoppingCart } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';

const routes = [
  {
    type: 'collapse',
    name: 'Dashboards',
    key: 'dashboards',
    icon: <IoHome size="15px" color="inherit" />,
    collapse: [
      {
        name: 'Main Dashboard',
        layout: '/admin',
        path: '/dashboards/default',
        component: <Default />,
      },
      {
        name: 'CRM',
        key: 'crm',
        layout: '/admin',
        path: '/dashboards/crm',
        component: <CRM />,
      },
    ],
  },
  { type: 'title', title: 'Pages', key: 'title-pages' },
  {
    type: 'collapse',
    name: 'Pages',
    key: 'pages',
    icon: <IoDocument size="15px" color="inherit" />,
    collapse: [
      {
        name: 'Profile',
        key: 'profile',
        collapse: [
          {
            name: 'Profile Overview',
            key: 'profile-overview',

            layout: '/admin',
            path: '/pages/profile/profile-overview',
            component: <ProfileOverview />,
          },
          {
            name: 'Teams',
            key: 'teams',

            layout: '/admin',
            path: '/pages/profile/teams',
            component: <Teams />,
          },
          {
            name: 'All Projects',
            key: 'all-projects',

            layout: '/admin',
            path: '/pages/profile/all-projects',
            component: <AllProjects />,
          },
        ],
      },
      {
        name: 'Users',
        key: 'users',
        collapse: [
          {
            name: 'Reports',
            key: 'reports',

            layout: '/admin',
            path: '/pages/users/reports',
            component: <Reports />,
          },
          {
            name: 'New User',
            key: 'new-user',

            layout: '/admin',
            path: '/pages/users/new-user',
            component: <NewUser />,
          },
        ],
      },
      {
        name: 'Account',
        key: 'account',
        collapse: [
          {
            name: 'Settings',
            key: 'settings',

            layout: '/admin',
            path: '/pages/account/settings',
            component: <Settings />,
          },
          {
            name: 'Billing',
            key: 'billing',

            layout: '/admin',
            path: '/pages/account/billing',
            component: <Billing />,
          },
          {
            name: 'Invoice',
            key: 'invoice',

            layout: '/admin',
            path: '/pages/account/invoice',
            component: <Invoice />,
          },
        ],
      },
      {
        name: 'Projects',
        key: 'projects',
        collapse: [
          {
            name: 'General',
            key: 'general',

            layout: '/admin',
            path: '/pages/projects/general',
            component: <General />,
          },
          {
            name: 'Timeline',
            key: 'timeline',

            layout: '/admin',
            path: '/pages/projects/timeline',
            component: <Timeline />,
          },
        ],
      },
      {
        name: 'Pricing Page',
        key: 'pricing-page',

        layout: '/admin',
        path: '/pages/pricing-page',
        component: <PricingPage />,
      },
      {
        name: 'RTL',
        key: 'rtl',
        layout: '/admin',
        path: '/pages/rtl',
        component: <RTL />,
      },
      {
        name: 'Widgets',
        key: 'widgets',
        layout: '/admin',
        path: '/pages/widgets',
        component: <Widgets />,
      },
      {
        name: 'Charts',
        key: 'charts',
        layout: '/admin',
        path: '/pages/charts',
        component: <Charts />,
      },
      {
        name: 'Alerts',
        key: 'alerts',

        layout: '/admin',
        path: '/pages/alerts',
        component: <Alerts />,
      },
    ],
  },
  {
    type: 'collapse',
    name: 'Applications',
    key: 'applications',
    icon: <IoBuild size="15px" color="inherit" />,
    collapse: [
      {
        name: 'Kanban',
        key: 'kanban',

        layout: '/admin',
        path: '/applications/kanban',
        component: <Kanban />,
      },
      {
        name: 'Wizard',
        key: 'wizard',

        layout: '/admin',
        path: '/applications/wizard',
        component: <Wizard />,
      },
      {
        name: 'Data Tables',
        key: 'data-tables',

        layout: '/admin',
        path: '/applications/data-tables',
        component: <DataTables />,
      },
      {
        name: 'Calendar',
        key: 'calendar',

        layout: '/admin',
        path: '/applications/calendar',
        component: <Calendar />,
      },
    ],
  },
  {
    type: 'collapse',
    name: 'Ecommerce',
    key: 'ecommerce',
    icon: <FaShoppingCart size="15px" color="inherit" />,
    collapse: [
      {
        name: 'Products',
        key: 'products',
        collapse: [
          {
            name: 'New Product',
            key: 'new-product',

            layout: '/admin',
            path: '/ecommerce/products/new-product',
            component: <NewProduct />,
          },
          {
            name: 'Edit Product',
            key: 'edit-product',

            layout: '/admin',
            path: '/ecommerce/products/edit-product',
            component: <EditProduct />,
          },
          {
            name: 'Product Page',
            key: 'product-page',

            layout: '/admin',
            path: '/ecommerce/products/product-page',
            component: <ProductPage />,
          },
        ],
      },
      {
        name: 'Orders',
        key: 'orders',
        collapse: [
          {
            name: 'Order List',
            key: 'order-list',

            layout: '/admin',
            path: '/ecommerce/orders/order-list',
            component: <OrderList />,
          },
          {
            name: 'Order Details',
            key: 'order-details',

            layout: '/admin',
            path: '/ecommerce/orders/order-details',
            component: <OrderDetails />,
          },
        ],
      },
    ],
  },
  {
    type: 'collapse',
    name: 'Authentication',
    key: 'authentication',
    icon: <IoDocuments size="15px" color="inherit" />,
    collapse: [
      {
        name: 'Sign In',
        key: 'sign-in',
        collapse: [
          {
            name: 'Basic',
            key: 'basic',
            layout: '/admin',
            path: '/authentication/sign-in/basic',
            component: <SignInBasic />,
          },
          {
            name: 'Cover',
            key: 'cover',
            layout: '/admin',
            path: '/authentication/sign-in/cover',
            component: <SignInCover />,
          },
          {
            name: 'Illustration',
            key: 'illustration',
            layout: '/admin',
            path: '/authentication/sign-in/illustration',
            component: <SignInIllustration />,
          },
        ],
      },
      {
        name: 'Sign Up',
        key: 'sign-up',
        collapse: [
          {
            name: 'Basic',
            key: 'basic',
            layout: '/admin',
            path: '/authentication/sign-up/basic',
            component: <SignUpBasic />,
          },
          {
            name: 'Cover',
            key: 'cover',
            layout: '/admin',
            path: '/authentication/sign-up/cover',
            component: <SignUpCover />,
          },
          {
            name: 'Illustration',
            key: 'illustration',
            layout: '/admin',
            path: '/authentication/sign-up/illustration',
            component: <SignUpIllustration />,
          },
        ],
      },
    ],
  },
];

export default routes;
