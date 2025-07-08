import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown'
import { useState } from 'react';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const AiComponent = () => {
    const [carType, setCarType] = useState("")
    const [carYear, setCarYear] = useState("")
    const [typeLuggage, setTypeLuggage] = useState("")
    const [response, setResponse] = useState("")
    const generateGeminiResponse = async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: `What type of car do you recommend I rent if I'm traveling with ${carType} people, ${typeLuggage} luggage, and have $${carYear}? `,
        });
        setResponse(response.text);
    }
    return (
        <>
            <div className="card p-4 mb-4 shadow-sm">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <input className="form-control" type="text" placeholder='number of people' value={carType} onChange={(e) => setCarType(e.target.value)} />
                    </div>
                    <div className="col-md-3">

                        <input className="form-control" type="number" placeholder='Whats your budget?' value={carYear} onChange={(e) => setCarYear(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                        

                        <select
                            className="form-control"
                            name="typeOfLuggage"
                            id="typeOfLuggage"
                            value={typeLuggage}
                            onChange={(e) => setTypeLuggage(e.target.value)}
                        >
                            <option value="light">light luggage</option>
                            <option value="medium">medium luggage</option>
                            <option value="heavy">heavy luggage</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                    <button className='btn signup w-100 ' onClick={generateGeminiResponse}>Send</button>
                    </div>
                    <div className='my-4'>
                        <Markdown>
                            {response}
                        </Markdown>
                    </div>
                </div>


            </div>
        </>
    )
}
export default AiComponent