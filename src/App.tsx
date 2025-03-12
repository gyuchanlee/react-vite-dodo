import React from 'react';
import './App.css';
import {ChakraProvider} from '@chakra-ui/react';
import {theme as chakraTheme} from '@chakra-ui/theme';
import {extendTheme} from '@chakra-ui/theme-utils';
import {RouterProvider} from "react-router-dom";
import router from "./routes/router.tsx";

// 슬랙과 유사한 색상으로 커스텀 테마 생성
const theme = extendTheme({
    colors: {
        slack: {
            purple: '#4A154B',
            green: '#2BAC76',
            blue: '#36C5F0',
            yellow: '#ECB22E',
            red: '#E01E5A',
            gray: '#1D1C1D',
            lightGray: '#F8F8F8',
        },
    },
}, chakraTheme);

const App: React.FC = () => {
    return (
        <ChakraProvider theme={theme}>
            <RouterProvider router={router} />
        </ChakraProvider>
    );
};

export default App;