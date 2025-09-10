export const promptCategoriesEn = [
    {
        category: "Creative Generation",
        prompts: [
            { name: 'Photo to Figure Model', prompt: 'turn this photo into a character figure. Behind it, place a box with the character’s image printed on it, and a computer showing the Blender modeling process on its screen. In front of the box, add a round plastic base with the character figure standing on it. set the scene indoors if possible' },
            { name: 'Architecture to Model', prompt: 'convert this photo into a architecture model. Behind the model, there should be a cardboard box with an image of the architecture from the photo on it. There should also be a computer, with the content on the computer screen showing the Blender modeling process of the figurine. In front of the cardboard box, place a cardstock and put the architecture model from the photo I provided on it. I hope the PVC material can be clearly presented. It would be even better if the background is indoors.' },
            { name: 'Photo to Action Figure', prompt: 'Transform the the person in the photo into an action figure, styled after [CHARACTER_NAME] from [SOURCE / CONTEXT]. \nNext to the figure, display the accessories including [ITEM_1], [ITEM_2], and [ITEM_3]. \nOn the top of the toy box, write "[BOX_LABEL_TOP]", and underneath it, "[BOX_LABEL_BOTTOM]". \nPlace the box in a [BACKGROUND_SETTING] environment. \nVisualize this in a highly realistic way with attention to fine details.' },
            { name: 'Photo to Funko Pop Style', prompt: "Transform the person in the photo into the style of a Funko Pop figure packaging box, presented in an isometric perspective. Label the packaging with the title 'ZHOGUE'. Inside the box, showcase the figure based on the person in the photo, accompanied by their essential items (such as cosmetics, bags, or others). Next to the box, also display the actual figure itself outside of the packaging, rendered in a realistic and lifelike style." },
            { name: 'Photo to LEGO Style', prompt: "Transform the person in the photo into the style of a LEGO minifigure packaging box, presented in an isometric perspective. Label the packaging with the title 'ZHOGUE'. Inside the box, showcase the LEGO minifigure based on the person in the photo, accompanied by their essential items (such as cosmetics, bags, or others) as LEGO accessories. Next to the box, also display the actual LEGO minifigure itself outside of the packaging, rendered in a realistic and lifelike style." },
            { name: 'Photo to Knit Doll', prompt: 'A close-up, professionally composed photograph showing a handmade crocheted yarn doll being gently held in both hands. The doll has a rounded shape and an adorable chibi-style appearance, with vivid color contrasts and rich details. The hands holding the doll appear natural and tender, with clearly visible finger posture, and the skin texture and light-shadow transitions look soft and realistic, conveying a warm, tangible touch. The background is slightly blurred, depicting an indoor setting with a warm wooden tabletop and natural light streaming in through a window, creating a cozy and intimate atmosphere. The overall image conveys a sense of exquisite craftsmanship and a cherished, heartwarming emotion.' },
            { name: 'Photo to Barbie Doll Style', prompt: "Transform the person in the photo into the style of a Barbie doll packaging box, presented in an isometric perspective. Label the packaging with the title 'ZHOGUE'. Inside the box, showcase the Barbie doll version of the person from the photo, accompanied by their essential items (such as cosmetics, bags, or others) designed as stylish Barbie accessories. Next to the box, also display the actual Barbie doll itself outside of the packaging, rendered in a realistic and lifelike style, resembling official Barbie promotional renders" },
            { name: 'Anything to Gundam Model', prompt: "Transform the person in the photo into the style of a Gundam model kit packaging box, presented in an isometric perspective. Label the packaging with the title 'ZHOGUE'. Inside the box, showcase a Gundam-style mecha version of the person from the photo, accompanied by their essential items (such as cosmetics, bags, or others) redesigned as futuristic mecha accessories. The packaging should resemble authentic Gunpla boxes, with technical illustrations, instruction-manual style details, and sci-fi typography. Next to the box, also display the actual Gundam-style mecha figure itself outside of the packaging, rendered in a realistic and lifelike style, similar to official Bandai promotional renders." },
            { name: 'Product Design to Realistic', prompt: 'turn this illustration of a perfume into a realistic version, Frosted glass bottle with a marble cap' },
            { name: 'Photo to Keychain Charm', prompt: 'Turn this photo into a cute charm hanging on the bag in the photo.\nTurn this photo into a flat acrylic keychain hanging on the bag in the photo.\nTurn this photo into a flat rubber keychain hanging on the bag in the photo.' },
            { name: 'Custom Character Sticker', prompt: 'Help me turn the character into a white-outlined sticker similar to Figure 2. The character needs to be converted to a web illustration style and add a playful white-outlined phrase describing Figure 1.' },
            { name: 'Custom Marble Sculpture', prompt: 'A hyper-detailed, realistic image of a sculpture of the main subject, made from shiny marble. The sculpture should show a smooth, reflective marble surface, emphasizing its luster and artistic craftsmanship. The design is elegant, highlighting the beauty and depth of the marble. The lighting in the image should enhance the contours and texture of the sculpture, creating a visually stunning and captivating effect.' },
            { name: 'Combine Objects', prompt: 'Creatively combine the objects from the main image and the reference image.' },
            { name: 'Virtual Reality Fusion', prompt: 'Add a couple sitting in the seats, happily drinking coffee and talking, in the main image. The character style should reference the cute, thick-lined illustration style from the other image.' },
            { name: 'Product Packaging Mockup', prompt: 'Paste the content of the main image onto the packaging box of the reference image, and place it in a minimally designed setting, professional photography.' },
            { name: 'Multi-view Result Generation', prompt: 'Generate front, back, left, right, top, and bottom views on a white background. Evenly distributed. Consistent subject. Isometric perspective equivalent.' },
        ],
    },
    {
        category: "Image Enhancement",
        prompts: [
            { name: 'Photo to Line Art', prompt: 'Turn into a line art hand-drawn sketch' },
            { name: 'Any Style to Realistic', prompt: 'turn this illustration into realistic version' },
            { name: 'HD Restoration', prompt: 'Enhance this image to high resolution' },
            { name: 'Color with Palette', prompt: 'Accurately use the color palette from the reference image to color this picture.' },
            { name: 'Colorize Old Photo', prompt: 'Restore and colorize this photo.' },
            { name: 'Lighting Style Transfer', prompt: 'Replace the lighting style of the main image with the lighting style of the reference image to make it look like a professional photograph.' },
            { name: 'Overlay Image Effect', prompt: 'Overlay the visual effect or style of the reference image onto the main image.' },
            { name: 'Add Watermark to Image', prompt: 'Repeatedly cover the entire image with the word "TRUMP".' },
            { name: 'Generate 4-Panel Drawing Process', prompt: 'Generate a four-panel drawing process for the character. Step 1: Line art, Step 2: Flat colors, Step 3: Add shadows, Step 4: Refine to completion. No text.' },
        ],
    },
    {
        category: "Character Editing",
        prompts: [
            { name: 'Anime to Realistic Photo', prompt: 'Generate a highly detailed photo of a girl cosplaying this illustration, at Comiket. Exactly replicate the same pose, body posture, hand gestures, facial expression, and camera framing as in the original illustration. Keep the same angle, perspective, and composition, without any deviation' },
            { name: 'Anime to Realistic Cosplayer', prompt: 'Generate a photo of a girl cosplaying this illustration, with the background set at Comiket' },
            { name: 'Photo to Professional Portrait', prompt: 'Transform the person in the photo into highly stylized ultra-realistic portrait, with sharp facial features and flawless fair skin, standing confidently against a bold green gradient background. Dramatic, cinematic lighting highlights her facial structure, evoking the look of a luxury fashion magazine cover. Editorial photography style, high-detail, 4K resolution, symmetrical composition, minimalistic background' },
            { name: 'Virtual Makeup', prompt: 'Apply the makeup from the reference image to the person in the main image, while keeping their original pose and facial features.' },
            { name: 'Change Character Perspective', prompt: 'change the Camera anglo a high-angled selfie perspective looking down at the woman, while preserving her exact facial features, expression, and clothing, Maintain the same living room interior background with the sofa, natural lighting, and overall photographic composition and style.' },
            { name: 'Pose Reference Swap', prompt: 'Precisely replace the pose of the person in the main image with the pose of the person in the reference image, and ensure the background is a professional photography studio.' },
            { name: 'Expression Reference Swap', prompt: 'Replace the expression of the person in the main image with the expression of the person in the reference image.' },
            { name: 'Change Character\'s Clothes', prompt: 'Replace the clothing of the person in the main image with the clothing shown in the reference image. Keep the main image person\'s pose, facial expression, background, and overall realism unchanged. Make the new clothing look natural, well-fitting, and consistent with the lighting and shadows.' },
            { name: 'Generate Character Sheet', prompt: 'Generate a character design sheet for me.\n\nProportion settings (comparison of different heights, head-to-body ratio, etc.)\n\nThree-view drawing (front, side, back)\n\nExpression Sheet\n\nPose Sheet → various common poses\n\nCostume Design' },
            { name: 'AI Baby Face Prediction', prompt: 'Based on the two people in the main and reference images, generate what their child would look like, in a professional photography style.' },
            { name: 'Generate Multiple Hairstyles', prompt: 'Generate headshots of this person with different hairstyles in a nine-panel grid.' },
            { name: 'Generate Many Poses', prompt: 'Please create a pose sheet for this illustration, showing a variety of poses.' },
        ],
    },
];

export const videoPromptCategoriesEn = [
    {
        category: "Animation Effects",
        prompts: [
            { name: 'Line Art Coloring Animation', prompt: 'The female character gradually changes from line art to a colored version, her blue robe flutters gently in the wind, bamboo leaves fall slowly in the background, red flowers gradually appear on her golden hair, holding a long staff in a confident standing posture, fixed camera.' },
        ],
    },
];