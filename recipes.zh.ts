export const promptCategoriesZh = [
    {
        category: "风格与物体转换",
        prompts: [
            { name: '图片转手办模型', prompt: 'turn this photo into a character figure. Behind it, place a box with the character’s image printed on it, and a computer showing the Blender modeling process on its screen. In front of the box, add a round plastic base with the character figure standing on it. set the scene indoors if possible' },
            { name: '建筑转模型', prompt: 'convert this photo into a architecture model. Behind the model, there should be a cardboard box with an image of the architecture from the photo on it. There should also be a computer, with the content on the computer screen showing the Blender modeling process of the figurine. In front of the cardboard box, place a cardstock and put the architecture model from the photo I provided on it. I hope the PVC material can be clearly presented. It would be even better if the background is indoors.' },
            { name: '图片转线稿', prompt: '变成线稿手绘图' },
            { name: '动漫转真人照片', prompt: 'Generate a highly detailed photo of a girl cosplaying this illustration, at Comiket. Exactly replicate the same pose, body posture, hand gestures, facial expression, and camera framing as in the original illustration. Keep the same angle, perspective, and composition, without any deviation' },
            { name: '动漫转真人Coser', prompt: '生成一个女孩cosplay这张插画的照片，背景设置在Comiket' },
            { name: '图片转可动人偶', prompt: 'Transform the the person in the photo into an action figure, styled after [CHARACTER_NAME] from [SOURCE / CONTEXT]. \nNext to the figure, display the accessories including [ITEM_1], [ITEM_2], and [ITEM_3]. \nOn the top of the toy box, write "[BOX_LABEL_TOP]", and underneath it, "[BOX_LABEL_BOTTOM]". \nPlace the box in a [BACKGROUND_SETTING] environment. \nVisualize this in a highly realistic way with attention to fine details.' },
            { name: '图片转Funko Pop风格', prompt: "Transform the person in the photo into the style of a Funko Pop figure packaging box, presented in an isometric perspective. Label the packaging with the title 'ZHOGUE'. Inside the box, showcase the figure based on the person in the photo, accompanied by their essential items (such as cosmetics, bags, or others). Next to the box, also display the actual figure itself outside of the packaging, rendered in a realistic and lifelike style." },
            { name: '图片转乐高风格', prompt: "Transform the person in the photo into the style of a LEGO minifigure packaging box, presented in an isometric perspective. Label the packaging with the title 'ZHOGUE'. Inside the box, showcase the LEGO minifigure based on the person in the photo, accompanied by their essential items (such as cosmetics, bags, or others) as LEGO accessories. Next to the box, also display the actual LEGO minifigure itself outside of the packaging, rendered in a realistic and lifelike style." },
            { name: '图片转针织玩偶', prompt: 'A close-up, professionally composed photograph showing a handmade crocheted yarn doll being gently held in both hands. The doll has a rounded shape and an adorable chibi-style appearance, with vivid color contrasts and rich details. The hands holding the doll appear natural and tender, with clearly visible finger posture, and the skin texture and light-shadow transitions look soft and realistic, conveying a warm, tangible touch. The background is slightly blurred, depicting an indoor setting with a warm wooden tabletop and natural light streaming in through a window, creating a cozy and intimate atmosphere. The overall image conveys a sense of exquisite craftsmanship and a cherished, heartwarming emotion.' },
            { name: '图片转芭比娃娃风格', prompt: "Transform the person in the photo into the style of a Barbie doll packaging box, presented in an isometric perspective. Label the packaging with the title 'ZHOGUE'. Inside the box, showcase the Barbie doll version of the person from the photo, accompanied by their essential items (such as cosmetics, bags, or others) designed as stylish Barbie accessories. Next to the box, also display the actual Barbie doll itself outside of the packaging, rendered in a realistic and lifelike style, resembling official Barbie promotional renders" },
            { name: '万物皆可高达模型', prompt: "Transform the person in the photo into the style of a Gundam model kit packaging box, presented in an isometric perspective. Label the packaging with the title 'ZHOGUE'. Inside the box, showcase a Gundam-style mecha version of the person from the photo, accompanied by their essential items (such as cosmetics, bags, or others) redesigned as futuristic mecha accessories. The packaging should resemble authentic Gunpla boxes, with technical illustrations, instruction-manual style details, and sci-fi typography. Next to the box, also display the actual Gundam-style mecha figure itself outside of the packaging, rendered in a realistic and lifelike style, similar to official Bandai promotional renders." },
            { name: '产品设计转实物图', prompt: 'turn this illustration of a perfume into a realistic version, Frosted glass bottle with a marble cap' },
            { name: '任意风格转写实', prompt: 'turn this illustration into realistic version' },
            { name: '图片转钥匙扣挂件', prompt: '把这张照片变成一个可爱挂件 挂在 照片的包包上\n把这张照片变成一个亚克力材质的扁平钥匙扣 挂在 照片的包包上\n把这张照片变成一个橡胶材质的扁平钥匙扣 挂在照片的包包上' },
            { name: '定制人物贴纸', prompt: '帮我将角色变成类似图2的白色轮廓贴纸。角色需要转换成网页插画风格，并添加一个描述图1的俏皮白色轮廓短语' },
            { name: '定制大理石雕塑', prompt: '一张超详细的图像中主体雕塑的写实图像，由闪亮的大理石制成。雕塑应展示光滑反光的大理石表面，强调其光泽和艺术工艺。设计优雅，突出大理石的美丽和深度。图像中的光线应增强雕塑的轮廓和纹理，创造出视觉上令人惊叹和迷人的效果' },
        ],
    },
    {
        category: "图像增强与特效",
        prompts: [
            { name: '高清修复', prompt: 'Enhance this image to high resolution' },
            { name: '使用调色板上色', prompt: '准确使用参考图的色卡为这张图片上色' },
            { name: '旧照片上色', prompt: '修复并为这张照片上色' },
            { name: '照片转专业写真', prompt: 'Transform the person in the photo into highly stylized ultra-realistic portrait, with sharp facial features and flawless fair skin, standing confidently against a bold green gradient background. Dramatic, cinematic lighting highlights her facial structure, evoking the look of a luxury fashion magazine cover. Editorial photography style, high-detail, 4K resolution, symmetrical composition, minimalistic background' },
            { name: '光影参考替换', prompt: '将主图的光影风格，替换为参考图的光影风格，使之看起来是专业摄影作品' },
            { name: '叠加图像效果', prompt: '将参考图的视觉效果或风格叠加到主图上' },
            { name: '虚拟试妆', prompt: '为主图中的人物化上参考图中的妆容，同时保持人物原本的姿势和面部特征' },
            { name: '为图像添加水印', prompt: '在整个图片上反复覆盖“TRUMP”这个词。' },
        ],
    },
    {
        category: "场景与角色操控",
        prompts: [
            { name: '改变角色视角', prompt: 'change the Camera anglo a high-angled selfie perspective looking down at the woman, while preserving her exact facial features, expression, and clothing, Maintain the same living room interior background with the sofa, natural lighting, and overall photographic composition and style.' },
            { name: '组合物体', prompt: '将主图与参考图中的物体进行创意组合' },
            { name: '虚拟现实融合', prompt: '在主图中加上一对情侣坐在座位上开心的喝咖啡和交谈，人物风格需参考另一张图中的粗线稿可爱插画风格' },
            { name: '姿势参考替换', prompt: '将主图中人物的姿势，精确地替换为参考图中人物的姿势，并确保背景为专业摄影棚' },
            { name: '表情参考替换', prompt: '将主图中人物的表情，替换为参考图中人物的表情' },
            { name: '人物换衣', prompt: '将主图中人物的服装替换为参考图中显示的服装。保持主图人物的姿势、面部表情、背景和整体真实感不变。让新服装看起来自然、合身，并与光线和阴影保持一致。' },
        ],
    },
    {
        category: "创意生成",
        prompts: [
            { name: '生成角色设定表', prompt: '为我生成人物的角色设定（Character Design）\n\n比例设定（不同身高对比、头身比等）\n\n三视图（正面、侧面、背面）\n\n表情设定（Expression Sheet） \n\n动作设定（Pose Sheet） → 各种常见姿势\n\n服装设定（Costume Design）' },
            { name: 'AI预测宝宝长相', prompt: '根据主图和参考图中的两个人，生成他们所生孩子的样子，专业摄影风格' },
            { name: '生成绘画过程四宫格', prompt: '为人物生成绘画过程四宫格，第一步：线稿，第二步平铺颜色，第三步：增加阴影，第四步：细化成型。不要文字' },
            { name: '产品包装样机', prompt: '把主图内容贴在参考图的包装盒上，并放在极简设计的布景中，专业摄影' },
            { name: '更换多种发型', prompt: '以九宫格的方式生成这个人不同发型的头像' },
            { name: '多视图结果生成', prompt: '在白色背景上生成前、后、左、右、上、下视图。均匀分布。一致的主体。等距透视等效' },
            { name: '超多人物姿势生成', prompt: '请为这幅插图创建一个姿势表，摆出各种姿势' },
        ],
    },
];

export const videoPromptCategoriesZh = [
    {
        category: "动画效果",
        prompts: [
            { name: '线稿上色动画', prompt: '女性角色从线稿逐渐变为彩色版本，蓝色长袍随风轻轻飘动，竹叶在背景中缓慢飘落，红色花朵在金色头发上逐渐显现，手持长杖保持自信站姿，固定镜头。' },
        ],
    },
];
